import React, { useState, useCallback } from "react";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Box,
} from "@mui/material";
import { useDropzone } from "react-dropzone";

const Content = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [articleForm, setArticleForm] = useState({
    title: "",
    subtitle: "",
    content: "",
  });

  // Handle article form changes
  const handleArticleChange = (e) => {
    setArticleForm({
      ...articleForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle article submission
  const handleArticleSubmit = (e) => {
    e.preventDefault();
    setArticles([...articles, { ...articleForm, id: Date.now() }]);
    setArticleForm({ title: "", subtitle: "", content: "" });
  };

  // Handle video upload (dummy function)
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideos([
        ...videos,
        {
          id: Date.now(),
          name: file.name,
          url: URL.createObjectURL(file),
        },
      ]);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      setVideos((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: file.name,
          url: URL.createObjectURL(file),
        },
      ]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Educational Content</h1>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        className="mb-6"
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: "bold",
          },
        }}
      >
        <Tab label="Upload Content" />
        <Tab label="View Content" />
      </Tabs>

      {activeTab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Article Upload Section */}
          <Card className="p-4 shadow-md">
            <h2 className="text-xl font-bold mb-4">Create Article</h2>
            <form onSubmit={handleArticleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={articleForm.title}
                onChange={handleArticleChange}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "1rem",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Subtitle"
                name="subtitle"
                value={articleForm.subtitle}
                onChange={handleArticleChange}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "1rem",
                  },
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                name="content"
                value={articleForm.content}
                onChange={handleArticleChange}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "1rem",
                  },
                }}
              />
              <Button
                variant="contained"
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#ef4444",
                }}
              >
                Submit Article
              </Button>
            </form>
          </Card>

          {/* Video Upload Section */}
          <Card className="p-4 shadow-md">
            <h2 className="text-xl font-bold mb-4">Upload Video</h2>
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  ${
                    isDragActive
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-red-500">Drop the video here...</p>
                ) : (
                  <p>Drag and drop video here, or click to select</p>
                )}
              </div>

              <Button
                variant="contained"
                component="label"
                className="bg-red-600 hover:bg-red-700"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#ef4444",
                }}
              >
                Upload Video
                <input
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={handleVideoUpload}
                />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Articles Display */}
          <div>
            <h2 className="text-xl font-bold mb-4">Articles</h2>
            {articles.map((article) => (
              <Card key={article.id} className="mb-4 shadow-md">
                <CardContent>
                  <h3 className="text-lg font-bold">{article.title}</h3>
                  <p className="text-gray-600">{article.subtitle}</p>
                  <p className="mt-2">{article.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Videos Display */}
          <div>
            <h2 className="text-xl font-bold mb-4">Videos</h2>
            {videos.map((video) => (
              <Card key={video.id} className="mb-4 shadow-md">
                <CardContent>
                  <h3 className="text-lg font-bold">{video.name}</h3>
                  <video controls className="w-full mt-2">
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;
