import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { DirectorProfile } from '../types';
import { Icon } from './Icon';

interface ImageUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (photoData: { directorId: string; base64Image: string }[]) => void;
  directors: DirectorProfile[];
}

export const ImageUploaderModal: React.FC<ImageUploaderModalProps> = ({ isOpen, onClose, onUpdate, directors }) => {
    const [stagedPhotos, setStagedPhotos] = useState<{ [directorId: string]: string }>({});
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, directorId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setStagedPhotos(prev => ({ ...prev, [directorId]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveChanges = () => {
        if (Object.keys(stagedPhotos).length === 0) {
            onClose();
            return;
        }

        const photoDataToUpdate = Object.entries(stagedPhotos).map(([directorId, base64Image]) => ({
            directorId,
            base64Image
        }));

        onUpdate(photoDataToUpdate);
        setSuccess(`Successfully updated ${photoDataToUpdate.length} photo(s).`);
        
        setTimeout(() => {
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        setStagedPhotos({});
        setSuccess(null);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Update Director Photos">
            <div className="space-y-4">
                <p className="text-sm text-slate-300 mb-2">
                    Click "Change Photo" next to a director to upload a new image from your device. Changes will be saved when you click "Save Changes".
                </p>

                <div className="max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    {directors.map(director => (
                        <div key={director.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-md border border-slate-700">
                           <div className="flex items-center gap-4">
                               <img 
                                   src={stagedPhotos[director.id] || director.photo} 
                                   alt={director.name} 
                                   className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                               />
                               <div>
                                   <p className="font-bold text-slate-200">{director.name} {director.lastName}</p>
                                   <p className="text-xs text-slate-400">{director.title}</p>
                               </div>
                           </div>

                           <div>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif, image/webp"
                                    ref={el => { fileInputRefs.current[director.id] = el; }}
                                    onChange={(e) => handleFileChange(e, director.id)}
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRefs.current[director.id]?.click()}
                                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md transition-colors"
                                >
                                    <Icon name="photo" className="w-4 h-4" />
                                    Change Photo
                                </button>
                           </div>
                        </div>
                    ))}
                </div>

                {success && <p className="text-sm text-center text-green-400 bg-green-900/50 p-2 rounded-md">{success}</p>}
                
                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-700">
                    <button onClick={handleClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleSaveChanges} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    );
};
