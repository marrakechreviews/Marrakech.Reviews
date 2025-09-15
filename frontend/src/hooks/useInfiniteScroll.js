import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (fetchFunction, initialFilters) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState(initialFilters);

  const fetchItems = useCallback(async (currentPage, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await fetchFunction({ ...filters, page: currentPage });

      setItems(prev => isLoadMore ? [...prev, ...response.items] : response.items);
      setPagination(response.pagination);
      setPage(currentPage);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [filters, fetchFunction]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    fetchItems(1);
  }, [filters, fetchItems]);

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchItems(page + 1, true);
    }
  };

  return {
    items,
    loading,
    loadingMore,
    pagination,
    filters,
    setFilters,
    loadMore,
  };
};
