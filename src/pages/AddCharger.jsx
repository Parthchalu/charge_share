import React, { useState, useEffect, useRef, useCallback } from "react";
import { Charger } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  Upload, 
  MapPin, 
  Camera, 
  X, 
  Zap,
  IndianRupee, 
  Info,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AvailabilityEditor from '../components/charger/AvailabilityEditor';

function LocationPicker({ onLocationSelect, selectedLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      // Only initialize if component is mounted, Google Maps API is loaded,
      // map container is available, and map has not been initialized yet.
      if (!isMounted || !window.google || !mapRef.current || mapInstanceRef.current) return;

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: selectedLocation || { lat: 19.0760, lng: 72.8777 }, // Default center, or selected
        zoom: selectedLocation ? 15 : 11, // Zoom closer if a location is already selected
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true, // Enable zoom controls
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER // Position zoom controls
        },
        gestureHandling: 'greedy', // Allow full map interaction
        disableDefaultUI: true, // This removes most Google branding (e.g., street view pegman, map type controls)
        clickableIcons: false, // Disable clickable POI icons
        tilt: 0, // Ensure a flat map view
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      mapInstanceRef.current = googleMap; // Store the map instance in the ref

      // Hide Google attribution after map loads
      setTimeout(() => {
        const mapContainer = mapRef.current;
        if (mapContainer) {
          const style = document.createElement('style');
          style.textContent = `
            .gm-style-cc,
            .gmnoprint,
            .gm-style .gmnoprint,
            .gm-bundled-control,
            .gm-fullscreen-control,
            [title="Toggle fullscreen view"],
            [title="Map Data"],
            [title="Terms"],
            [title="Report a map error"] {
              display: none !important;
            }
            
            .pac-container {
              border-radius: 12px !important;
              border: 1px solid #e5e7eb !important;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
              margin-top: 4px !important;
              font-family: inherit !important;
            }
            
            .pac-item {
              padding: 12px 16px !important;
              border-bottom: 1px solid #f3f4f6 !important;
              cursor: pointer !important;
              transition: background-color 0.15s ease !important;
            }
            
            .pac-item:hover {
              background-color: #f9fafb !important;
            }
            
            .pac-item:last-child {
              border-bottom: none !important;
            }
            
            .pac-item-selected {
              background-color: #eff6ff !important;
            }
            
            .pac-icon {
              width: 20px !important;
              height: 20px !important;
              margin-right: 12px !important;
              margin-top: 2px !important;
            }
            
            .pac-item-query {
              font-size: 14px !important;
              font-weight: 500 !important;
              color: #111827 !important;
            }
            
            .pac-matched {
              font-weight: 600 !important;
              color: #2563eb !important;
            }
            
            .pac-item .pac-item-query .pac-matched {
              color: #2563eb !important;
            }
            
            .pac-secondary-text {
              color: #6b7280 !important;
              font-size: 13px !important;
              margin-top: 2px !important;
            }
            
            .pac-logo:after {
              display: none !important;
            }
          `;
          document.head.appendChild(style);
        }
      }, 1000);

      // Initialize Places Autocomplete
      if (searchInputRef.current && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            types: ['establishment', 'geocode'], // Limit to establishments (businesses) and geocodes (addresses)
            componentRestrictions: { country: 'IN' }, // Restrict to India
            fields: ['place_id', 'geometry', 'name', 'formatted_address'] // Request necessary fields
          }
        );
        
        autocompleteRef.current = autocomplete; // Store autocomplete instance

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            onLocationSelect({ lat, lng });
            googleMap.setCenter({ lat, lng });
            googleMap.setZoom(16); // Zoom in closer on selected place
          }
        });
      }

      googleMap.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationSelect({ lat, lng });
      });
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`; 
      script.async = true; 
      script.defer = true; 
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      // If already loaded, initialize immediately with a small delay to ensure DOM readiness
      setTimeout(initMap, 50);
    }

    // Cleanup function for this effect
    return () => {
      isMounted = false;
      mapInstanceRef.current = null; // Clear map instance on unmount
      // Autocomplete instance doesn't need explicit cleanup, as it's tied to the input element.
    };
  }, [onLocationSelect, selectedLocation]); // Re-run if onLocationSelect or initial selectedLocation changes

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) {
      // If map or Google API not ready, ensure no marker is present
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      return;
    }

    // Clear previous marker if it exists
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    // Add new marker if location is selected
    if (selectedLocation) {
      const newMarker = new window.google.maps.Marker({
        position: selectedLocation,
        map: map,
        title: "Selected Location",
        animation: window.google.maps.Animation.DROP, // Add a drop animation
        icon: { // Custom circle icon for the marker
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4', // Google blue
          fillOpacity: 1,
          strokeColor: '#ffffff', // White border
          strokeWeight: 3,
          scale: 8 // Size of the circle
        }
      });
      markerRef.current = newMarker; // Store the new marker in the ref
      map.setCenter(selectedLocation); // Center the map on the new marker
    }
  }, [selectedLocation]); // Only re-run when selectedLocation changes

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for your charging station location..."
          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-900 placeholder-gray-500 font-medium transition-all duration-200 hover:shadow-md focus:shadow-lg"
        />
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full rounded-xl border border-gray-200 overflow-hidden shadow-sm"
        style={{ height: '300px' }}
      >
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-gray-50 text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-700 font-medium mb-2">Select Your Location</p>
          <p className="text-sm text-gray-500">Search above or click anywhere on the map to mark your charger's exact location</p>
        </div>
      </div>
    </div>
  );
}

export default function AddChargerPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [chargerId, setChargerId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    latitude: null,
    longitude: null,
    connector_type: "",
    power_kw: "",
    price_per_hour: "",
    photos: [],
    auto_accept: true,
    availability_hours: {}
  });
  
  const [errors, setErrors] = useState({});

  const loadChargerForEdit = useCallback(async (id) => {
    try {
      const chargerData = await Charger.get(id);
      const user = await User.me(); // Load current user for host_id reference later
      setCurrentUser(user);
      setFormData({
        ...chargerData,
        power_kw: chargerData.power_kw.toString(),
        price_per_hour: chargerData.price_per_hour.toString(),
        // Ensure availability_hours is an object, default to empty if null/undefined
        availability_hours: chargerData.availability_hours || {}
      });
    } catch (error) {
      console.error("Failed to load charger for editing:", error);
      // If charger not found or error, redirect to my chargers or home
      navigate(createPageUrl("MyChargers"));
    }
  }, [navigate]);

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user.app_role !== 'host') {
        // Update user role to host if they're adding a charger
        await User.updateMyUserData({ app_role: 'host' });
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      // Optionally handle user load error, e.g., redirect to login
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chargerToEdit = urlParams.get('edit');
    
    if (chargerToEdit) {
      setEditMode(true);
      setChargerId(chargerToEdit);
      loadChargerForEdit(chargerToEdit);
    } else {
      loadCurrentUser();
    }
  }, [loadChargerForEdit, loadCurrentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
    setErrors(prev => ({
      ...prev,
      location: null
    }));
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    setUploadingPhoto(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return file_url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls]
      }));
    } catch (error) {
      console.error("Failed to upload photos:", error);
      // Optionally set an error message for photo upload
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.connector_type) newErrors.connector_type = "Connector type is required";
    if (!formData.power_kw || parseFloat(formData.power_kw) <= 0) newErrors.power_kw = "Valid power rating is required";
    if (!formData.price_per_hour || parseFloat(formData.price_per_hour) <= 0) newErrors.price_per_hour = "Valid price is required";
    if (formData.latitude === null || formData.longitude === null) newErrors.location = "Please select location on map";
    if (formData.photos.length === 0) newErrors.photos = "At least one photo is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!currentUser) {
      setErrors({ submit: "User data not loaded. Please wait or refresh." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        host_id: currentUser.id,
        power_kw: parseFloat(formData.power_kw),
        price_per_hour: parseFloat(formData.price_per_hour),
      };

      if (editMode) {
        await Charger.update(chargerId, payload);
      } else {
        await Charger.create({
          ...payload,
          is_active: true,
          rating: 0,
          total_reviews: 0
        });
      }
      
      navigate(createPageUrl("MyChargers")); // Redirect to MyChargers page
    } catch (error) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} charger:`, error);
      setErrors({ submit: `Failed to ${editMode ? 'update' : 'create'} charger. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("MyChargers"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {editMode ? 'Edit Charger' : 'Add New Charger'}
            </h1>
            <p className="text-gray-500 mt-1">
              {editMode ? 'Update the details for your station' : 'List your charging station and start earning'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Charger Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Fast Charging at Downtown Mall"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description & Access Instructions</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your charger location, parking instructions, and any special notes for drivers..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="h-24"
                />
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter complete address with pincode"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Location Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Selection *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Search for your address or click on the map to mark your charger's exact location</p>
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
                selectedLocation={formData.latitude !== null ? { lat: formData.latitude, lng: formData.longitude } : null}
              />
              {formData.latitude !== null && formData.longitude !== null && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Location selected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
              {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location}</p>}
            </CardContent>
          </Card>

          {/* Charger Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Charger Specifications *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Connector Type *</Label>
                  <Select
                    value={formData.connector_type}
                    onValueChange={(value) => handleInputChange("connector_type", value)}
                  >
                    <SelectTrigger className={errors.connector_type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select connector type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Type-2">Type-2 (Most Common)</SelectItem>
                      <SelectItem value="CCS">CCS (Fast Charging)</SelectItem>
                      <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                      <SelectItem value="GB/T">GB/T</SelectItem>
                      <SelectItem value="Tesla-Supercharger">Tesla Supercharger</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.connector_type && <p className="text-red-500 text-sm mt-1">{errors.connector_type}</p>}
                </div>

                <div>
                  <Label htmlFor="power_kw">Charging Power (kW) *</Label>
                  <Input
                    id="power_kw"
                    type="number"
                    placeholder="e.g. 22"
                    value={formData.power_kw}
                    onChange={(e) => handleInputChange("power_kw", e.target.value)}
                    className={errors.power_kw ? "border-red-500" : ""}
                  />
                  {errors.power_kw && <p className="text-red-500 text-sm mt-1">{errors.power_kw}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Pricing *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="price_per_hour">Price per Hour (₹) *</Label>
                <Input
                  id="price_per_hour"
                  type="number"
                  placeholder="e.g. 150"
                  value={formData.price_per_hour}
                  onChange={(e) => handleInputChange("price_per_hour", e.target.value)}
                  className={errors.price_per_hour ? "border-red-500" : ""}
                />
                {errors.price_per_hour && <p className="text-red-500 text-sm mt-1">{errors.price_per_hour}</p>}
                <p className="text-gray-500 text-sm mt-1">Platform takes 15% commission</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Set the weekly schedule when your charger is available for booking. Leave a day off if it's unavailable.</p>
              <AvailabilityEditor
                value={formData.availability_hours}
                onChange={(newValue) => handleInputChange('availability_hours', newValue)}
              />
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photos *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">Upload photos of your charger, parking area, and access route</p>
              
              {/* Photo Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700">Upload Photos</p>
                  <p className="text-gray-500">Drag and drop or click to browse</p>
                  {uploadingPhoto && (
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Photo Preview */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Charger photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}
            </CardContent>
          </Card>

          {/* Submit */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("MyChargers"))}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save Changes" : "Create Charger Listing")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}