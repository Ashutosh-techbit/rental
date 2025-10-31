import React, { useRef, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import "./UploadImage.css";
import { Button, Group, TextInput, Stack, Text } from "@mantine/core";
const UploadImage = ({
  propertyDetails,
  setPropertyDetails,
  nextStep,
  prevStep,
}) => {
  const [imageURL, setImageURL] = useState(propertyDetails.image);
  const fileInputRef = useRef();
  const [manualURL, setManualURL] = useState("");
  const handleNext = () => {
    setPropertyDetails((prev) => ({ ...prev, image: imageURL }));
    nextStep();
  };
  const handleFileUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageURL(e.target?.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleManualURL = () => {
    if (manualURL.trim()) setImageURL(manualURL.trim());
  };
  return (
    <div className="flexColCenter uploadWrapper">
      <Stack spacing="md" style={{ width: "100%", maxWidth: "500px" }}>
        <Text size="lg" weight={500}>Upload Property Image</Text>

        <Stack spacing="md">
          <div>
            <Text size="sm" weight={500} mb="xs">Upload from computer:</Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ 
                marginBottom: "10px",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%"
              }}
            />
          </div>

          <div>
            <Text size="sm" weight={500} mb="xs">Or enter image URL:</Text>
            <TextInput
              placeholder="https://example.com/image.jpg"
              value={manualURL}
              onChange={(e) => setManualURL(e.target.value)}
              rightSection={
                <Button size="xs" onClick={handleManualURL}>
                  Use URL
                </Button>
              }
            />
          </div>
        </Stack>

        {imageURL && (
          <div style={{ textAlign: "center" }}>
            <Text size="sm" weight={500} mb="xs">Preview:</Text>
            <img 
              src={imageURL} 
              alt="Preview" 
              style={{ 
                maxWidth: "100%", 
                maxHeight: "200px", 
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }} 
            />
          </div>
        )}
      </Stack>

      <Group position="center" mt={"xl"}>
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!imageURL}>
          Next
        </Button>
      </Group>
    </div>
  );
};

export default UploadImage;
