import React from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/home/Hero';
import CategoryCards from '../components/home/CategoryCards';
import PopularEquipments from '../components/home/PopularEquipments';
import CallToAction from '../components/home/CallToAction';
import Footer from '../components/layout/Footer';

function Home() {
  return (
    <div className='min-h-screen'>
      <Header />
      <Hero />
      <CategoryCards />
      <PopularEquipments />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default Home;