import { useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * MediaUploader Component
 * Shopee-style image uploader with grid layout, preview, and cover photo designation
 * @param {Array} images - Array of File objects
 * @param {Function} onChange - Callback when images change
 * @param {Number} maxImages - Maximum number of images (default: 5)
 */
export default function MediaUploader({ images = [], onChange, maxImages = 5 }) {
    const [previews, setPreviews] = useState([]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = maxImages - images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            alert(`Maksimal ${maxImages} gambar. Hanya ${remainingSlots} gambar yang akan ditambahkan.`);
        }

        // Create previews
        const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);

        // Update parent component
        onChange([...images, ...filesToAdd]);
    };

    const handleDelete = (index) => {
        // Revoke object URL to prevent memory leak
        URL.revokeObjectURL(previews[index]);

        // Update images and previews
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setPreviews(newPreviews);
        onChange(newImages);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
                {/* Uploaded Images */}
                {images.map((file, index) => (
                    <div key={index} className="relative group" style={{ width: '96px', height: '96px' }}>
                        <img
                            src={previews[index] || URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-md border-2 border-orange-300"
                        />

                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-red-50 hover:border-red-300"
                            aria-label="Hapus gambar"
                        >
                            <X className="w-4 h-4 text-red-500" />
                        </button>

                        {/* Cover Photo Label (First Image) */}
                        {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-[10px] text-center py-1 rounded-b-md">
                                Foto Sampul
                            </div>
                        )}
                    </div>
                ))}

                {/* Add More Button */}
                {images.length < maxImages && (
                    <label
                        htmlFor="media-upload-input"
                        className="w-24 h-24 border-2 border-dashed border-orange-600 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-700 transition-all"
                        style={{ width: '96px', height: '96px' }}
                    >
                        <Plus className="w-6 h-6 text-orange-600 mb-1" />
                        <span className="text-[10px] text-orange-600 font-medium text-center px-1">
                            + Tambah<br />Foto/Video
                        </span>
                    </label>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                id="media-upload-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Info Text */}
            <p className="text-xs text-gray-600">
                📸 Upload hingga {maxImages} gambar. Format: JPG, PNG, GIF, WebP.
                <span className="text-orange-600 font-medium"> Otomatis dikonversi ke WebP &lt;500KB</span>
            </p>

            {images.length > 0 && (
                <p className="text-xs text-gray-500">
                    ✅ {images.length} gambar dipilih. Gambar pertama akan menjadi foto sampul.
                </p>
            )}
        </div>
    );
}
