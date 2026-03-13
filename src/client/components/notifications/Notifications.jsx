import Header from '../layout/Header';
import Footer from '../layout/Footer';
import NotificationsPage from './NotificationsPage';

const Notifications = () => (
  <div className='min-h-screen bg-gray-50 flex flex-col'>
    <Header />
    <div className='flex-1'>
      <NotificationsPage />
    </div>
    <Footer />
  </div>
);

export default Notifications;