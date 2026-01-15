    import React from 'react';
    import Header from '../../components/layout/Header';
    import Footer from '../../components/layout/Footer';

    function Explore() {
    return (
        <div className='min-h-screen'>
        <Header />
        <div className='container mx-auto px-4 py-20'>
            <h1 className='text-4xl font-bold mb-8'>Explorer les Équipements</h1>
            <p className='text-gray-600'>Page d'exploration - En développement</p>
        </div>
        <Footer />
        </div>
    );
    }

    export default Explore;