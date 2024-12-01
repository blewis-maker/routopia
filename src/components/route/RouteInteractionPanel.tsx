import React, { useState, useEffect } from 'react';
import { RouteData, Waypoint } from '@/types/maps';
import { Section, Button, Panel } from '@/components/common/styles';

interface Props {
  route: RouteData;
  onRouteUpdate: (route: RouteData) => void;
  onWaypointAdd: (waypoint: Waypoint) => void;
  onWaypointRemove: (index: number) => void;
  onWaypointReorder: (fromIndex: number, toIndex: number) => void;
}

export const RouteInteractionPanel: React.FC<Props> = ({
  route,
  onRouteUpdate,
  onWaypointAdd,
  onWaypointRemove,
  onWaypointReorder
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [activeWaypoint, setActiveWaypoint] = useState<number | null>(null);

  useEffect(() => {
    setWaypoints(route.waypoints);
  }, [route]);

  const handleWaypointDrag = (index: number, newPosition: [number, number]) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints[index] = {
      ...updatedWaypoints[index],
      position: newPosition
    };
    setWaypoints(updatedWaypoints);
    onRouteUpdate({ ...route, waypoints: updatedWaypoints });
  };

  const handleWaypointClick = (index: number) => {
    setActiveWaypoint(activeWaypoint === index ? null : index);
  };

  const handleAddWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      position: [0, 0],
      type: 'via',
      name: `Waypoint ${waypoints.length + 1}`
    };
    onWaypointAdd(newWaypoint);
  };

  return (
    <Panel className="route-interaction-panel">
      <Section>
        <h2>Route Details</h2>
        <div className="route-summary">
          <div>Distance: {route.distance}km</div>
          <div>Duration: {route.duration}min</div>
          <div>Elevation: {route.elevation}m</div>
        </div>
      </Section>

      <Section>
        <h3>Waypoints</h3>
        <div className="waypoints-list">
          {waypoints.map((waypoint, index) => (
            <div
              key={waypoint.id}
              className={`waypoint-item ${activeWaypoint === index ? 'active' : ''}`}
              onClick={() => handleWaypointClick(index)}
            >
              <div className="waypoint-name">{waypoint.name}</div>
              <div className="waypoint-actions">
                <Button
                  onClick={() => onWaypointRemove(index)}
                  variant="icon"
                >
                  Remove
                </Button>
                {index > 0 && (
                  <Button
                    onClick={() => onWaypointReorder(index, index - 1)}
                    variant="icon"
                  >
                    Move Up
                  </Button>
                )}
                {index < waypoints.length - 1 && (
                  <Button
                    onClick={() => onWaypointReorder(index, index + 1)}
                    variant="icon"
                  >
                    Move Down
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleAddWaypoint}>Add Waypoint</Button>
      </Section>

      <Section>
        <h3>Route Options</h3>
        <div className="route-options">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'primary' : 'secondary'}
          >
            {isEditing ? 'Save Changes' : 'Edit Route'}
          </Button>
          <Button
            onClick={() => onRouteUpdate({ ...route, optimize: true })}
            variant="secondary"
          >
            Optimize Route
          </Button>
        </div>
      </Section>
    </Panel>
  );
}; 