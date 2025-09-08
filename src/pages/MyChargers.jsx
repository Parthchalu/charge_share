
import React, { useState, useEffect } from "react";
import { Charger, User } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Zap, ArrowLeft, Eye, Edit, ToggleLeft, ToggleRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function MyChargerCard({ charger, onStatusToggle }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <div className="lg:flex">
        <div className="lg:w-64 h-40 lg:h-auto bg-gray-100">
          {charger.photos && charger.photos.length > 0 ? (
            <img src={charger.photos[0]} alt={charger.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Zap className="w-12 h-12" />
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{charger.title}</h3>
            <button
              onClick={() => onStatusToggle(charger.id, charger.is_active)}
              className="text-gray-400 hover:text-gray-600"
            >
              {charger.is_active ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <ToggleRight className="w-6 h-6" /> Active
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <ToggleLeft className="w-6 h-6" /> Inactive
                </div>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{charger.address}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{charger.connector_type}</Badge>
            <Badge variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              {charger.power_kw} kW
            </Badge>
            <Badge variant="outline">₹{charger.price_per_hour}/hr</Badge>
            {charger.rating > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                {charger.rating.toFixed(1)}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Link to={createPageUrl(`ChargerDetails?id=${charger.id}`)}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View Public Page
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl(`AddCharger?edit=${charger.id}`))}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MyChargersPage() {
  const navigate = useNavigate();
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyChargers();
  }, []);

  const loadMyChargers = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      const chargersData = await Charger.filter({ host_id: user.id }, '-created_date');
      setChargers(chargersData);
    } catch (error) {
      console.error("Failed to load chargers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (chargerId, currentStatus) => {
    try {
      await Charger.update(chargerId, { is_active: !currentStatus });
      loadMyChargers(); // Refresh the list
    } catch (error) {
      console.error("Failed to update charger status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-8 w-1/3 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("HostDashboard"))}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Chargers</h1>
              <p className="text-gray-500 mt-1">View and manage all your listings</p>
            </div>
          </div>
          <Link to={createPageUrl("AddCharger")}>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Charger
            </Button>
          </Link>
        </div>

        {chargers.length > 0 ? (
          <div className="space-y-6">
            {chargers.map((charger) => (
              <MyChargerCard key={charger.id} charger={charger} onStatusToggle={handleStatusToggle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">You haven't listed any chargers yet</h3>
            <p className="text-gray-500 mb-6">Start earning by adding your first charging station.</p>
            <Link to={createPageUrl("AddCharger")}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                List Your First Charger
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
