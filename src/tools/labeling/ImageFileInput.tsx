type GetImageFromFileProps = {
  handleImageSelected: (image: HTMLImageElement) => void;
};

function GetImageFromFile({ handleImageSelected }: GetImageFromFileProps) {
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
          handleImageSelected(image);
          URL.revokeObjectURL(imageUrl);
        };

        image.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          console.error("Kunne ikkje laste biletet.");
        };

        image.src = imageUrl;
      }}
    />
  );
}

export default GetImageFromFile;
