import { Scene3D } from './Scene3D';
import { BasicCan } from './BasicCan';

export function Scene3DTest() {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      <Scene3D>
        <BasicCan 
          color="#e74c3c" 
          position={[0, 0, 0]} 
          animate={true}
        />
        
        {/* Additional test cans */}
        <BasicCan 
          color="#3498db" 
          position={[-2, 0, 0]} 
          scale={0.8}
        />
        
        <BasicCan 
          color="#2ecc71" 
          position={[2, 0, 0]} 
          scale={1.2}
        />
      </Scene3D>
    </div>
  );
}