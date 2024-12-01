import { useCallback, useRef, useState } from 'react';

interface MomentumState {
  velocity: { x: number; y: number };
  amplitude: { x: number; y: number };
  timestamp: number;
  frame: number;
  offset: { x: number; y: number };
}

export const useMomentumGestures = (
  onScroll: (x: number, y: number) => void,
  options = {
    friction: 0.92,
    bounceStiffness: 0.08,
    maxBounce: 150,
    minVelocity: 0.1
  }
) => {
  const momentumRef = useRef<MomentumState>({
    velocity: { x: 0, y: 0 },
    amplitude: { x: 0, y: 0 },
    timestamp: 0,
    frame: 0,
    offset: { x: 0, y: 0 }
  });

  const boundaries = useRef({
    min: { x: 0, y: 0 },
    max: { x: 0, y: 0 }
  });

  const track = useCallback(() => {
    const { frame, timestamp, velocity, amplitude, offset } = momentumRef.current;
    const elapsed = Date.now() - timestamp;
    let delta = { x: 0, y: 0 };

    // Apply momentum with elastic boundaries
    if (amplitude.x !== 0 || amplitude.y !== 0) {
      ['x', 'y'].forEach(axis => {
        const initialVelocity = velocity[axis];
        let currentOffset = offset[axis];

        // Apply friction
        velocity[axis] *= options.friction;

        // Apply elastic boundaries
        if (currentOffset < boundaries.current.min[axis]) {
          const bounce = (boundaries.current.min[axis] - currentOffset) * options.bounceStiffness;
          velocity[axis] += bounce;
        } else if (currentOffset > boundaries.current.max[axis]) {
          const bounce = (boundaries.current.max[axis] - currentOffset) * options.bounceStiffness;
          velocity[axis] += bounce;
        }

        // Update offset
        delta[axis] = velocity[axis] * elapsed;
        currentOffset += delta[axis];
        offset[axis] = currentOffset;

        // Stop if velocity is too low
        if (Math.abs(velocity[axis]) < options.minVelocity) {
          amplitude[axis] = 0;
        }
      });

      momentumRef.current.frame = requestAnimationFrame(track);
      onScroll(delta.x, delta.y);
    }
  }, [options, onScroll]);

  const startMomentum = useCallback((velocity: { x: number; y: number }) => {
    cancelAnimationFrame(momentumRef.current.frame);
    momentumRef.current = {
      ...momentumRef.current,
      velocity,
      amplitude: { x: velocity.x * 1.2, y: velocity.y * 1.2 },
      timestamp: Date.now()
    };
    momentumRef.current.frame = requestAnimationFrame(track);
  }, [track]);

  const stopMomentum = useCallback(() => {
    cancelAnimationFrame(momentumRef.current.frame);
    momentumRef.current.amplitude = { x: 0, y: 0 };
  }, []);

  return {
    startMomentum,
    stopMomentum,
    setBoundaries: (min: { x: number; y: number }, max: { x: number; y: number }) => {
      boundaries.current = { min, max };
    }
  };
}; 