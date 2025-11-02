import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

interface TouchControlsProps {
  enableRotation?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  rotationSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
}

export function TouchControls({
  enableRotation = true,
  enableZoom = true,
  enablePan = true,
  rotationSpeed = 1,
  zoomSpeed = 1,
  panSpeed = 1,
  minDistance = 2,
  maxDistance = 10,
}: TouchControlsProps) {
  const { camera, gl } = useThree();
  // const gestureState = useTouchGestures(); // Reserved for future gesture detection
  
  const touchState = useRef({
    touches: [] as Touch[],
    lastDistance: 0,
    lastRotation: { x: 0, y: 0 },
    lastPan: { x: 0, y: 0 },
    isActive: false,
  });

  useEffect(() => {
    const domElement = gl.domElement;

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      touchState.current.touches = Array.from(event.touches);
      touchState.current.isActive = true;

      if (event.touches.length === 2) {
        // Initialize pinch-to-zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        touchState.current.lastDistance = distance;

        // Initialize pan
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        touchState.current.lastPan = { x: centerX, y: centerY };
      } else if (event.touches.length === 1) {
        // Initialize rotation
        const touch = event.touches[0];
        touchState.current.lastRotation = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      
      if (!touchState.current.isActive) return;

      if (event.touches.length === 2 && (enableZoom || enablePan)) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        // Handle pinch-to-zoom
        if (enableZoom) {
          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );
          
          const deltaDistance = distance - touchState.current.lastDistance;
          const zoomFactor = 1 + (deltaDistance * zoomSpeed * 0.01);
          
          // Apply zoom by moving camera closer/farther
          const direction = camera.position.clone().normalize();
          const newDistance = Math.max(
            minDistance,
            Math.min(maxDistance, camera.position.length() / zoomFactor)
          );
          
          camera.position.copy(direction.multiplyScalar(newDistance));
          touchState.current.lastDistance = distance;
        }

        // Handle two-finger pan
        if (enablePan) {
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;
          
          const deltaX = centerX - touchState.current.lastPan.x;
          const deltaY = centerY - touchState.current.lastPan.y;
          
          // Convert screen coordinates to world coordinates for panning
          const panVector = {
            x: -deltaX * panSpeed * 0.01,
            y: deltaY * panSpeed * 0.01,
          };
          
          camera.position.x += panVector.x;
          camera.position.y += panVector.y;
          
          touchState.current.lastPan = { x: centerX, y: centerY };
        }
      } else if (event.touches.length === 1 && enableRotation) {
        // Handle single-finger rotation
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchState.current.lastRotation.x;
        const deltaY = touch.clientY - touchState.current.lastRotation.y;
        
        // Calculate rotation around Y-axis (horizontal movement)
        const rotationY = deltaX * rotationSpeed * 0.01;
        
        // Calculate rotation around X-axis (vertical movement)
        const rotationX = deltaY * rotationSpeed * 0.01;
        
        // Apply rotation by orbiting camera around origin
        const spherical = {
          radius: camera.position.length(),
          phi: Math.atan2(camera.position.z, camera.position.x) - rotationY,
          theta: Math.acos(Math.max(-1, Math.min(1, camera.position.y / camera.position.length()))) - rotationX,
        };
        
        // Clamp theta to prevent flipping
        spherical.theta = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.theta));
        
        // Convert back to Cartesian coordinates
        camera.position.set(
          spherical.radius * Math.sin(spherical.theta) * Math.cos(spherical.phi),
          spherical.radius * Math.cos(spherical.theta),
          spherical.radius * Math.sin(spherical.theta) * Math.sin(spherical.phi)
        );
        
        camera.lookAt(0, 0, 0);
        
        touchState.current.lastRotation = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      touchState.current.touches = Array.from(event.touches);
      
      if (event.touches.length === 0) {
        touchState.current.isActive = false;
      } else if (event.touches.length === 1) {
        // Transition from multi-touch to single-touch
        const touch = event.touches[0];
        touchState.current.lastRotation = { x: touch.clientX, y: touch.clientY };
      }
    };

    // Add event listeners with passive: false to prevent default scrolling
    domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    domElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      domElement.removeEventListener('touchstart', handleTouchStart);
      domElement.removeEventListener('touchmove', handleTouchMove);
      domElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, gl, enableRotation, enableZoom, enablePan, rotationSpeed, zoomSpeed, panSpeed, minDistance, maxDistance]);

  return null; // This component doesn't render anything
}