    import React from 'react';
    import Header from '../../components/layout/Header';
    import Footer from '../../components/layout/Footer';

    function Profile() {
    return (
        <div className='min-h-screen'>
        <Header />
        <div className='container px-4 py-20 mx-auto'>
            <h1 className='mb-8 text-4xl font-bold'>Mon Profil</h1>
            <p className='text-gray-600'>Page de profil - En développement</p>
        </div>
        <Footer />
        </div>
    );
    }

    export default Profile;