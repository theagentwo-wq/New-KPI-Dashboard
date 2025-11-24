
import type { Location } from "../data/locations";
import { LocationMap } from "./LocationMap";
import { LocationSelector } from "./LocationSelector";

interface LocationDetailsProps {
    location: Location | null;
    locations: Location[];
    onLocationSelect: (location: Location) => void;
    isLoading: boolean;
}

// A simple skeleton loader component to provide visual feedback during loading
const SkeletonLoader = () => (
    <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full">&nbsp;</div>
);

export const LocationDetails = ({ location, locations, onLocationSelect, isLoading }: LocationDetailsProps) => {

    return (
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <LocationSelector locations={locations} onSelect={onLocationSelect} />
            <div className="mt-4 h-64">
                {
                    // If the map is loading, display the skeleton loader.
                    // Otherwise, if a location is selected, display the map.
                    isLoading ? (
                        <SkeletonLoader />
                    ) : location ? (
                        <LocationMap location={location} />
                    ) : (
                        // If no location is selected and the map is not loading, show a prompt.
                        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                            <p className="text-gray-500">Select a location to see details.</p>
                        </div>
                    )
                }
            </div>
            {location && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">{location.name}</h2>
                    <p className="text-gray-600">{location.address}</p>
                </div>
            )}
        </div>
    );
};
