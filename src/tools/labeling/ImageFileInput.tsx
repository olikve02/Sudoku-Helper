type ImageFileInputProps = {
  onImageSelected: (image: HTMLImageElement) => void;
};

// Filvelger som laster det valgte bildet og gir det videre som et <img>-element
function ImageFileInput({ onImageSelected }: ImageFileInputProps) {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const image = new Image();
        const imageUrl = URL.createObjectURL(file);

        image.onload = () => {
          onImageSelected(image);
          URL.revokeObjectURL(imageUrl);
        };

        image.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          console.error("Kunne ikke laste bildet.");
        };

        image.src = imageUrl;
      }}
    />
  );
}

export default ImageFileInput;
