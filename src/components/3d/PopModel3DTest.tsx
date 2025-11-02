import { Scene3D } from './Scene3D';
import { PopModel3D } from './PopModel3D';
import { PopModel3DEnhanced } from './PopModel3DEnhanced';
import { usePopStore } from '../../stores/popStore';

export function PopModel3DTest() {
  const { pops } = usePopStore();
  
  // Get first few pops for testing
  const testPops = pops.slice(0, 3);

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      <Scene3D cameraPosition={[0, 2, 8]}>
        {testPops.map((pop, index) => (
          <PopModel3D
            key={pop.id}
            pop={pop}
            position={[(index - 1) * 3, 0, 0]}
            animate={index === 1} // Only animate the middle one
            showLabel={true}
            scale={0.8}
          />
        ))}
        
        {/* Enhanced model showcase */}
        {testPops[0] && (
          <PopModel3DEnhanced
            pop={testPops[0]}
            position={[0, -3, 0]}
            animate={true}
            showLabel={true}
            quality="high"
            scale={1.2}
          />
        )}
      </Scene3D>
    </div>
  );
}