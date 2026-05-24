package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

const defaultAddr = ":8090"
const defaultRoot = "webdav_root"

func main() {
	root := envOr("WEBDAV_ROOT", defaultRoot)
	addr := envOr("WEBDAV_ADDR", defaultAddr)

	if err := os.MkdirAll(root, 0o755); err != nil {
		log.Fatal(err)
	}

	handler := &webdavServer{root: root}
	mux := http.NewServeMux()
	mux.Handle("/", handler)

	log.Printf("WebDAV-сервер GO09_01s: http://localhost%s/webdav/\n", addr)
	log.Printf("корневая папка: %s\n", mustAbs(root))

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}

type webdavServer struct {
	root string
}

func (s *webdavServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.URL.Path, "/webdav") {
		http.NotFound(w, r)
		return
	}

	rel := strings.TrimPrefix(r.URL.Path, "/webdav")
	rel = strings.TrimPrefix(rel, "/")
	localPath, err := s.safePath(rel)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet, http.MethodHead:
		s.handleGet(w, r, localPath)
	case http.MethodPut:
		s.handlePut(w, r, localPath)
	case "MKCOL":
		s.handleMkcol(w, localPath)
	case http.MethodDelete:
		s.handleDelete(w, localPath)
	case "COPY":
		s.handleCopy(w, r, localPath)
	case "MOVE":
		s.handleMove(w, r, localPath)
	default:
		w.Header().Set("Allow", "GET, HEAD, PUT, MKCOL, DELETE, COPY, MOVE")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *webdavServer) safePath(rel string) (string, error) {
	clean := filepath.Clean("/" + rel)
	clean = strings.TrimPrefix(clean, "/")
	full := filepath.Join(s.root, clean)
	absRoot, err := filepath.Abs(s.root)
	if err != nil {
		return "", err
	}
	absFull, err := filepath.Abs(full)
	if err != nil {
		return "", err
	}
	if absFull != absRoot && !strings.HasPrefix(absFull, absRoot+string(os.PathSeparator)) {
		return "", fmt.Errorf("path outside root")
	}
	return absFull, nil
}

func (s *webdavServer) handleGet(w http.ResponseWriter, r *http.Request, path string) {
	info, err := os.Stat(path)
	if err != nil || info.IsDir() {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, path)
}

func (s *webdavServer) handlePut(w http.ResponseWriter, r *http.Request, path string) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	f, err := os.Create(path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer f.Close()

	if _, err := io.Copy(f, r.Body); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *webdavServer) handleMkcol(w http.ResponseWriter, path string) {
	if _, err := os.Stat(path); err == nil {
		http.Error(w, "already exists", http.StatusMethodNotAllowed)
		return
	}
	if err := os.MkdirAll(path, 0o755); err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *webdavServer) handleDelete(w http.ResponseWriter, path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		http.NotFound(w, nil)
		return
	}
	if err := os.RemoveAll(path); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *webdavServer) handleCopy(w http.ResponseWriter, r *http.Request, src string) {
	dst, err := s.destinationPath(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := copyPath(src, dst); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *webdavServer) handleMove(w http.ResponseWriter, r *http.Request, src string) {
	dst, err := s.destinationPath(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := os.Rename(src, dst); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (s *webdavServer) destinationPath(r *http.Request) (string, error) {
	dest := r.Header.Get("Destination")
	if dest == "" {
		return "", fmt.Errorf("missing Destination header")
	}
	u, err := url.Parse(dest)
	if err != nil {
		return "", err
	}
	rel := strings.TrimPrefix(u.Path, "/webdav")
	rel = strings.TrimPrefix(rel, "/")
	return s.safePath(rel)
}

func copyPath(src, dst string) error {
	info, err := os.Stat(src)
	if err != nil {
		return err
	}
	if info.IsDir() {
		return copyDir(src, dst)
	}
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		target := filepath.Join(dst, rel)
		if info.IsDir() {
			return os.MkdirAll(target, info.Mode())
		}
		return copyPath(path, target)
	})
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustAbs(path string) string {
	abs, err := filepath.Abs(path)
	if err != nil {
		return path
	}
	return abs
}
