    import React from 'react';
    import { useParams } from 'react-router-dom';
    import Header from '../../components/layout/Header';
    import Footer from '../../components/layout/Footer';

    function Equipment() {
    const { id } = useParams();
    
    return (
        <div className='min-h-screen'>
        <Header />
        <div className='container px-4 py-20 mx-auto'>
            <h1 className='mb-8 text-4xl font-bold'>Détails de l'Équipement #{id}</h1>
            <p className='text-gray-600'>Page de détails - En développement</p>
        </div>
        <Footer />
        </div>
    );
    }

    export default Equipment;