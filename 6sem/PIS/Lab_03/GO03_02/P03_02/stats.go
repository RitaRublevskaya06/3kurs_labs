package p03_02

import (
	"fmt"
	"sync"
)

type Stats struct {
	getCount  int
	postCount int
	mutex     sync.RWMutex
}

func NewStats() *Stats {
	return &Stats{
		getCount:  0,
		postCount: 0,
	}
}

func (s *Stats) PlusGet() {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	s.getCount++
}

func (s *Stats) PlusPost() {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	s.postCount++
}

func (s *Stats) GenStr() string {
	s.mutex.RLock()
	defer s.mutex.RUnlock()
	return fmt.Sprintf("Get-request count = %d, Post-request count = %d",
		s.getCount, s.postCount)
}
