import React from 'react';
import icono from '../../assets/img/Icono.png';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <img
        src={icono}
        alt="Cargando..."
        className="w-20 h-20 object-contain animate-heartbeat"
      />
    </div>
  );
};

export default Loader;
