// hooks/useSearch.ts
import { useQuery } from '@tanstack/react-query';
import { searchService, SearchParams } from '@/api/services/search';

export const useSearchHotels = (params: SearchParams) => {
  return useQuery({
    queryKey: ['search-hotels', params],
    queryFn: () => searchService.searchHotels(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => searchService.getSearchSuggestions(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};