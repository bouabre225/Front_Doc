    import React from 'react';
    import EquipmentCard from './EquipmentCard';

    const EquipmentList = ({ equipments }) => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {equipments.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
        </div>
    );
    };

    export default EquipmentList;