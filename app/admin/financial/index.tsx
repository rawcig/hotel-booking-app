// app/admin/financial/index.tsx
// Financial reports screen

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { financialService, FinancialReport, PaymentMethodsData, RevenueReport } from '@/services/financialService';

// Simple bar chart component
const BarChart = ({ data }: { data: { period: string; amount: number }[] }) => {
  if (!data || data.length === 0) return null;

  const maxAmount = Math.max(...data.map(item => item.amount), 0);
  const chartHeight = 150;
  const barWidth = 30;
  const barSpacing = 20;
  const totalWidth = data.length * (barWidth + barSpacing);

  return (
    <View className="mt-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: totalWidth, height: chartHeight + 40 }} className="flex-row items-end pb-6">
          {data.map((item, index) => {
            const barHeight = maxAmount > 0 ? (item.amount / maxAmount) * chartHeight : 0;
            return (
              <View key={index} className="items-center" style={{ width: barWidth + barSpacing }}>
                <View
                  className="bg-green-500 rounded-t-md w-full"
                  style={{ height: Math.max(barHeight, 2) }}
                />
                <Text className="text-xs text-gray-600 mt-2 text-center" numberOfLines={1}>
                  {item.period}
                </Text>
                <Text className="text-xs font-bold text-gray-800 mt-1" numberOfLines={1}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(item.amount)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// Simple pie chart component for payment methods
const PaymentMethodsChart = ({ data }: { data: PaymentMethodsData }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const totalAmount = Object.values(data).reduce((sum, method) => sum + method.amount, 0);
  const chartSize = 120;

  // Calculate angles for each segment
  let cumulativePercentage = 0;
  const segments = Object.entries(data).map(([method, info]) => {
    const percentage = totalAmount > 0 ? (info.amount / totalAmount) * 100 : 0;
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += percentage;
    const endAngle = (cumulativePercentage / 100) * 360;
    
    return {
      method,
      percentage,
      startAngle,
      endAngle,
      amount: info.amount
    };
  });

  return (
    <View className="mt-4">
      <View className="flex-row justify-between items-center">
        <View className="items-center">
          <View 
            className="bg-gray-200 rounded-full justify-center items-center"
            style={{ width: chartSize, height: chartSize }}
          >
            <Text className="text-lg font-bold text-gray-800">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalAmount)}
            </Text>
            <Text className="text-xs text-gray-600">Total</Text>
          </View>
        </View>
        
        <View className="flex-1 ml-4">
          {segments.map((segment, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
              />
              <Text className="text-sm text-gray-700 flex-1">{segment.method}</Text>
              <Text className="text-sm font-medium text-gray-800">
                {segment.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function FinancialReports() {
  const router = useRouter();
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsData | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch financial data when component mounts
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Fetch financial report
        const reportResponse = await financialService.getFinancialReport();
        if (reportResponse.success && reportResponse.report) {
          setFinancialReport(reportResponse.report);
        }
        
        // Fetch payment methods data
        const paymentResponse = await financialService.getPaymentMethods();
        if (paymentResponse.success && paymentResponse.paymentMethods) {
          setPaymentMethods(paymentResponse.paymentMethods);
        }
        
        // Fetch revenue report
        const revenueResponse = await financialService.getRevenueReport();
        if (revenueResponse.success && revenueResponse.revenue) {
          setRevenueReport(revenueResponse.revenue);
        }
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-8">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-lg font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Financial Reports</Text>
          <View className="w-10" /> {/* Spacer for alignment */}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading financial reports...</Text>
        </View>
      ) : (
        <View className="p-4">
          {/* Financial Summary */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Financial Summary</Text>
            
            {financialReport && (
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total Revenue:</Text>
                  <Text className="font-bold text-green-600">
                    {formatCurrency(financialReport.totals.totalRevenue)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total Bookings:</Text>
                  <Text className="font-bold text-blue-600">
                    {formatNumber(financialReport.totals.totalBookings)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Average Booking Value:</Text>
                  <Text className="font-bold text-purple-600">
                    {formatCurrency(financialReport.totals.averageBookingValue)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Revenue Trend Chart */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Revenue Trend</Text>
            
            {revenueReport && revenueReport.chartData.length > 0 ? (
              <BarChart data={revenueReport.chartData} />
            ) : (
              <Text className="text-gray-500 italic">No revenue trend data available</Text>
            )}
          </View>

          {/* Payment Methods Chart */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Payment Methods</Text>
            
            {paymentMethods && Object.keys(paymentMethods).length > 0 ? (
              <PaymentMethodsChart data={paymentMethods} />
            ) : (
              <Text className="text-gray-500 italic">No payment data available</Text>
            )}
          </View>

          {/* Hotel Performance */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Hotel Performance</Text>
            
            {financialReport && Object.keys(financialReport.hotelPerformance).length > 0 ? (
              <View className="gap-3">
                {Object.entries(financialReport.hotelPerformance)
                  .sort(([,a], [,b]) => b.revenue - a.revenue) // Sort by revenue descending
                  .map(([hotel, data], index) => (
                    <View key={hotel} className="mb-3">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-gray-700 font-medium" numberOfLines={1}>{hotel}</Text>
                        <Text className="font-bold text-green-600">
                          {formatCurrency(data.revenue)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600 text-sm">
                          {formatNumber(data.bookings)} bookings
                        </Text>
                        <View className="flex-row items-center w-24">
                          <View className="h-2 bg-gray-200 rounded-full flex-1">
                            <View 
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ 
                                width: `${Math.min(100, (data.revenue / (financialReport.totals.totalRevenue || 1)) * 100)}%` 
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            ) : (
              <Text className="text-gray-500 italic">No hotel performance data available</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}