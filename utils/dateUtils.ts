const MAX_IMAGE_WIDTH = 1500; // pixels

export const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (img.width <= MAX_IMAGE_WIDTH) {
                    resolve(file);
                    return;
                }
                const canvas = document.createElement('canvas');
                const scaleFactor = MAX_IMAGE_WIDTH / img.width;
                canvas.width = MAX_IMAGE_WIDTH;
                canvas.height = img.height * scaleFactor;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('Canvas toBlob failed'));
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        const resizedFile = new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
                        resolve(resizedFile);
                    }, 'image/jpeg', 0.9
                );
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
