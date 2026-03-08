    import React from 'react';
    import EquipmentCard from './EquipmentCard';
import { useLang } from '../../context/LangContext';

    const EquipmentList = ({ equipments }) => {
  const { t } = useLang();
    return (
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {equipments.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
        </div>
    );
    };

    export default EquipmentList;