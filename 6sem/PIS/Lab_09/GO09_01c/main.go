package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

const (
	defaultBaseURL = "http://localhost:8081/webdav/"
	defaultUser    = "webdavuser"
	defaultPass    = "password123"
)

func main() {
	baseURL := envOr("WEBDAV_URL", defaultBaseURL)
	user := envOr("WEBDAV_USER", defaultUser)
	pass := envOr("WEBDAV_PASS", defaultPass)
	useAuth := os.Getenv("WEBDAV_NO_AUTH") == ""

	if len(os.Args) < 2 {
		printUsage()
		log.Fatal("укажите команду")
	}

	client := &webdavClient{baseURL: baseURL, user: user, pass: pass, useAuth: useAuth}
	cmd := os.Args[1]

	switch cmd {
	case "mkcol":
		if len(os.Args) != 3 {
			log.Fatal("использование: mkcol <dir>")
		}
		client.mkcol(os.Args[2])
	case "put":
		if len(os.Args) != 4 {
			log.Fatal("использование: put <local-file> <remote-file>")
		}
		client.put(os.Args[2], os.Args[3])
	case "get":
		if len(os.Args) != 3 {
			log.Fatal("использование: get <remote-file>")
		}
		client.get(os.Args[2])
	case "delete":
		if len(os.Args) != 3 {
			log.Fatal("использование: delete <remote-path>")
		}
		client.deleteResource(os.Args[2])
	case "copy":
		if len(os.Args) != 4 {
			log.Fatal("использование: copy <src> <dst>")
		}
		client.copyResource(os.Args[2], os.Args[3])
	case "move":
		if len(os.Args) != 4 {
			log.Fatal("использование: move <src> <dst>")
		}
		client.moveResource(os.Args[2], os.Args[3])
	default:
		log.Fatalf("неизвестная команда: %s", cmd)
	}
}

func printUsage() {
	fmt.Println("GO09_01c — WebDAV-клиент")
	fmt.Println("  GO09_01c mkcol <dir>")
	fmt.Println("  GO09_01c put <local-file> <remote-file>")
	fmt.Println("  GO09_01c get <remote-file>")
	fmt.Println("  GO09_01c delete <remote-path>")
	fmt.Println("  GO09_01c copy <src> <dst>")
	fmt.Println("  GO09_01c move <src> <dst>")
	fmt.Println()
	fmt.Println("Переменные окружения: WEBDAV_URL, WEBDAV_USER, WEBDAV_PASS, WEBDAV_NO_AUTH=1")
}

type webdavClient struct {
	baseURL string
	user    string
	pass    string
	useAuth bool
}

func (c *webdavClient) basicAuth() string {
	auth := c.user + ":" + c.pass
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(auth))
}

func normalizePath(path string) string {
	return strings.ReplaceAll(path, "\\", "/")
}

func (c *webdavClient) request(method, path string, body io.Reader) (*http.Response, error) {
	path = normalizePath(path)
	req, err := http.NewRequest(method, c.baseURL+path, body)
	if err != nil {
		return nil, err
	}
	if c.useAuth {
		req.Header.Set("Authorization", c.basicAuth())
	}
	return http.DefaultClient.Do(req)
}

func (c *webdavClient) mkcol(dir string) {
	resp, err := c.request("MKCOL", dir+"/", nil)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusCreated:
		fmt.Printf("каталог '%s' создан\n", dir)
	case http.StatusMethodNotAllowed:
		fmt.Printf("каталог '%s' уже существует\n", dir)
	default:
		fmt.Printf("MKCOL ошибка: %s\n", resp.Status)
	}
}

func (c *webdavClient) put(localFile, remoteFile string) {
	data, err := os.ReadFile(localFile)
	if err != nil {
		log.Fatal("не удалось прочитать локальный файл:", err)
	}

	resp, err := c.request(http.MethodPut, remoteFile, bytes.NewReader(data))
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusNoContent {
		fmt.Printf("файл '%s' загружен как '%s'\n", localFile, remoteFile)
	} else {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("PUT ошибка: %s\n%s\n", resp.Status, string(body))
	}
}

func (c *webdavClient) get(remoteFile string) {
	resp, err := c.request(http.MethodGet, remoteFile, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("содержимое '%s':\n---\n%s\n---\n", remoteFile, string(body))
	} else {
		fmt.Printf("GET ошибка: %s\n", resp.Status)
	}
}

func (c *webdavClient) deleteResource(path string) {
	resp, err := c.request(http.MethodDelete, path, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNoContent {
		fmt.Printf("'%s' удалён\n", path)
	} else {
		fmt.Printf("DELETE ошибка: %s\n", resp.Status)
	}
}

func (c *webdavClient) copyResource(src, dst string) {
	src, dst = normalizePath(src), normalizePath(dst)
	req, err := http.NewRequest("COPY", c.baseURL+src, nil)
	if err != nil {
		log.Fatal(err)
	}
	if c.useAuth {
		req.Header.Set("Authorization", c.basicAuth())
	}
	req.Header.Set("Destination", c.baseURL+dst)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusNoContent {
		fmt.Printf("скопировано '%s' -> '%s'\n", src, dst)
	} else {
		fmt.Printf("COPY ошибка: %s\n", resp.Status)
	}
}

func (c *webdavClient) moveResource(src, dst string) {
	src, dst = normalizePath(src), normalizePath(dst)
	req, err := http.NewRequest("MOVE", c.baseURL+src, nil)
	if err != nil {
		log.Fatal(err)
	}
	if c.useAuth {
		req.Header.Set("Authorization", c.basicAuth())
	}
	req.Header.Set("Destination", c.baseURL+dst)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusNoContent {
		fmt.Printf("перемещено '%s' -> '%s'\n", src, dst)
	} else {
		fmt.Printf("MOVE ошибка: %s\n", resp.Status)
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
