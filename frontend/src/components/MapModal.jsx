import React, { useEffect, useRef } from 'react';
import { FiX, FiExternalLink, FiNavigation } from 'react-icons/fi';
import './MapModal.css';

const MapModal = ({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude, 
  title = "Location", 
  showDirections = false,
  destinationLat = null,
  destinationLng = null,
  destinationTitle = "Destination"
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (isOpen && latitude && longitude && window.google) {
      initializeMap();
    }
  }, [isOpen, latitude, longitude]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapOptions = {
      center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "on" }]
        }
      ]
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

    // Add marker for the main location
    const marker = new window.google.maps.Marker({
      position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      map: mapInstanceRef.current,
      title: title,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="8" fill="#4CAF50" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16)
      }
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${title}</h3>
          <p style="margin: 0; color: #666; font-size: 12px;">
            Lat: ${parseFloat(latitude).toFixed(6)}<br>
            Lng: ${parseFloat(longitude).toFixed(6)}
          </p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    // If showing directions, add destination marker and route
    if (showDirections && destinationLat && destinationLng) {
      const destinationMarker = new window.google.maps.Marker({
        position: { lat: parseFloat(destinationLat), lng: parseFloat(destinationLng) },
        map: mapInstanceRef.current,
        title: destinationTitle,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="8" fill="#FF5722" stroke="#fff" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="#fff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      // Add destination info window
      const destInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${destinationTitle}</h3>
            <p style="margin: 0; color: #666; font-size: 12px;">
              Lat: ${parseFloat(destinationLat).toFixed(6)}<br>
              Lng: ${parseFloat(destinationLng).toFixed(6)}
            </p>
          </div>
        `
      });

      destinationMarker.addListener('click', () => {
        destInfoWindow.open(mapInstanceRef.current, destinationMarker);
      });

      // Add directions
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We already have custom markers
        polylineOptions: {
          strokeColor: '#4CAF50',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRenderer.setMap(mapInstanceRef.current);

      directionsService.route({
        origin: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        destination: { lat: parseFloat(destinationLat), lng: parseFloat(destinationLng) },
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
      });
    }
  };

  const openInGoogleMaps = () => {
    if (showDirections && destinationLat && destinationLng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destinationLat},${destinationLng}&travelmode=driving`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        '_blank'
      );
    }
  };

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${latitude},${longitude}&travelmode=driving`,
          '_blank'
        );
      }, () => {
        // Fallback if geolocation fails
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
          '_blank'
        );
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <h3 className="map-modal-title">
            {showDirections ? 'Route Map' : title}
          </h3>
          <div className="map-modal-actions">
            <button
              className="map-action-btn"
              onClick={getDirections}
              title="Get directions from your location"
            >
              <FiNavigation />
            </button>
            <button
              className="map-action-btn"
              onClick={openInGoogleMaps}
              title="Open in Google Maps"
            >
              <FiExternalLink />
            </button>
            <button
              className="map-modal-close"
              onClick={onClose}
              title="Close map"
            >
              <FiX />
            </button>
          </div>
        </div>
        
        <div className="map-modal-content">
          <div ref={mapRef} className="google-map-container" />
          {!window.google && (
            <div className="map-loading">
              <p>Loading Google Maps...</p>
              <div className="map-loading-spinner"></div>
            </div>
          )}
        </div>
        
        <div className="map-modal-footer">
          <div className="map-coordinates">
            <span>📍 {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}</span>
            {showDirections && destinationLat && destinationLng && (
              <span>🎯 {parseFloat(destinationLat).toFixed(6)}, {parseFloat(destinationLng).toFixed(6)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
