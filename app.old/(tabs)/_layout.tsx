import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, Text, View } from 'react-native';
import "../global.css";

const TabIcon = ({focused, iconSource, title}: {focused: boolean; iconSource: any; title: string}) => {
  return (
    <View className='flex flex-row w-full flex-1 min-w-[100px] min-h-14 mt-4 justify-center items-center rounded-full overflow-hidden relative'>
      {focused ? (
        <ImageBackground source={images.highlight} className='flex flex-col w-full flex-1 min-w-[106px] min-h-16 justify-center items-center rounded-full overflow-hidden' resizeMode='cover'>
          <Image source={iconSource} tintColor='#151312' className='size-5 mb-1' />
          <Text className='text-secondary text-sm font-semibold ml-2'>{title}</Text>
        </ImageBackground>
      ) : (
        <Image source={iconSource} tintColor='#A8B5DB' className='size-5' />
      )}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle:{
          backgroundColor: '#0f0d23',
          paddingHorizontal: 20,
          position: 'absolute',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#151312',
       
        },
        tabBarItemStyle:{
          marginTop: 10,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',

        }
      }}>  
      <Tabs.Screen 
          name="index" 
          options={{
            title: 'Home', 
            headerShown: false, 
            tabBarIcon:({ focused })=>(
              <TabIcon 
                focused={focused}
                iconSource ={icons.home}
                title="Home"
              />
            )
          }} 
      />
      <Tabs.Screen 
        name="my_booking" 
        options={{
          title: 'My Booking', 
          headerShown: false,
          tabBarIcon:({ focused })=>(
            <TabIcon 
              focused={focused}
              iconSource ={icons.booking}
              title="My Booking"
            />
          )

        }}
      />
      <Tabs.Screen 
        name="messages" 
        options={{
          title:"Messages", 
          headerShown: false,
          tabBarIcon:({ focused })=>(
            <TabIcon 
              focused={focused}
              iconSource ={icons.messages}
              title="Messages"
            />
          )

        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title:"Profile", 
          headerShown: false,
          tabBarIcon:({ focused })=>(
            <TabIcon 
              focused={focused}
              iconSource ={icons.user}
              title="Profile"
            />
          )

        }} 
      />
    </Tabs>
  )
}