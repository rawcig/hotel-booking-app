// app/admin/reports.tsx
// Admin reports and analytics screen

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { analyticsService, AnalyticsEvent, ErrorLog } from '@/services/analyticsService';
import { useAdmin } from '@/context/AdminContext';

export default function AdminReports() {
  const { admin } = useAdmin();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    setSummary(analyticsService.getSummary());
    setBookingAnalytics(analyticsService.getBookingAnalytics());
    setRecentEvents(analyticsService.getEvents(10));
    setRecentErrors(analyticsService.getErrors(10));
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
    setRefreshing(false);
  };

  const clearAnalytics = () => {
    analyticsService.clearData();
    loadAnalytics();
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-8">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-lg font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Reports & Analytics</Text>
          <View className="w-10" /> {/* Spacer for alignment */}
        </View>
        
        <Text className="text-white/80">Track application performance and user behavior</Text>
      </View>

      {/* Summary Cards */}
      <View className="px-4 -mt-4">
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
            <Text className="text-2xl font-bold text-blue-600">{summary?.events?.today || 0}</Text>
            <Text className="text-gray-600 text-sm text-center">Events (24h)</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
            <Text className="text-2xl font-bold text-red-500">{summary?.errors?.today || 0}</Text>
            <Text className="text-gray-600 text-sm text-center">Errors (24h)</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
            <Text className="text-2xl font-bold text-green-500">{bookingAnalytics?.totalBookings || 0}</Text>
            <Text className="text-gray-600 text-sm text-center">Bookings</Text>
          </View>
        </View>
      </View>

      {/* Booking Analytics */}
      {bookingAnalytics && (
        <View className="px-4 mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Booking Performance</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Total Bookings</Text>
              <Text className="font-medium">{bookingAnalytics.totalBookings}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Completed</Text>
              <Text className="font-medium text-green-600">{bookingAnalytics.completedBookings}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Cancelled</Text>
              <Text className="font-medium text-red-600">{bookingAnalytics.cancelledBookings}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Conversion Rate</Text>
              <Text className="font-medium">{bookingAnalytics.conversionRate}%</Text>
            </View>
          </View>
        </View>
      )}

      {/* Error Severity Distribution */}
      {summary?.errors?.severities && (
        <View className="px-4 mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Error Distribution (24h)</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Critical</Text>
              <View className="flex-row items-center">
                <View className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                  <View 
                  className="h-2 bg-red-600 rounded-full" 
                  style={{ width: `${(summary.errors.severities.critical / Math.max(1, Object.values(summary.errors.severities).reduce((a, b) => (a as number) + (b as number), 0) as number)) * 100}%` }}
                />
                </View>
                <Text className="font-medium">{summary.errors.severities.critical}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">High</Text>
              <View className="flex-row items-center">
                <View className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                  <View 
                  className="h-2 bg-orange-500 rounded-full" 
                  style={{ width: `${(summary.errors.severities.high / Math.max(1, Object.values(summary.errors.severities).reduce((a, b) => (a as number) + (b as number), 0) as number)) * 100}%` }}
                />
                </View>
                <Text className="font-medium">{summary.errors.severities.high}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Medium</Text>
              <View className="flex-row items-center">
                <View className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                  <View 
                  className="h-2 bg-yellow-500 rounded-full" 
                  style={{ width: `${(summary.errors.severities.medium / Math.max(1, Object.values(summary.errors.severities).reduce((a, b) => (a as number) + (b as number), 0) as number)) * 100}%` }}
                />
                </View>
                <Text className="font-medium">{summary.errors.severities.medium}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Low</Text>
              <View className="flex-row items-center">
                <View className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                  <View 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${(summary.errors.severities.low / Math.max(1, Object.values(summary.errors.severities).reduce((a, b) => (a as number) + (b as number), 0) as number)) * 100}%` }}
                />
                </View>
                <Text className="font-medium">{summary.errors.severities.low}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Recent Events */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">Recent Events</Text>
          <Text className="text-blue-600 text-sm">{recentEvents.length} events</Text>
        </View>
        
        <View className="bg-white rounded-xl shadow-sm">
          {recentEvents.length > 0 ? (
            recentEvents.map((event, index) => (
              <View 
                key={index} 
                className={`p-3 ${index < recentEvents.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">{event.event}</Text>
                    <Text className="text-gray-600 text-sm">{event.category} • {event.action}</Text>
                    {event.label && (
                      <Text className="text-gray-500 text-sm mt-1">{event.label}</Text>
                    )}
                  </View>
                  <Text className="text-gray-400 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className="p-6 items-center">
              <Text className="text-gray-500">No recent events</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent Errors */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">Recent Errors</Text>
          <Text className="text-red-600 text-sm">{recentErrors.length} errors</Text>
        </View>
        
        <View className="bg-white rounded-xl shadow-sm">
          {recentErrors.length > 0 ? (
            recentErrors.map((error, index) => (
              <View 
                key={error.errorId} 
                className={`p-3 ${index < recentErrors.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className={`font-medium ${
                      error.severity === 'critical' ? 'text-red-600' :
                      error.severity === 'high' ? 'text-orange-600' :
                      error.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {error.error}
                    </Text>
                    <Text className="text-gray-600 text-sm">{error.message}</Text>
                    {error.component && (
                      <Text className="text-gray-500 text-xs mt-1">Component: {error.component}</Text>
                    )}
                  </View>
                  <Text className="text-gray-400 text-xs">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className="p-6 items-center">
              <Text className="text-gray-500">No recent errors</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-4 pb-8">
        <TouchableOpacity 
          onPress={clearAnalytics}
          className="bg-red-500 py-3 rounded-xl items-center mb-3"
        >
          <Text className="text-white font-medium">Clear Analytics Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}