// /api/proxy-cover.js

export default async function handler(req, res) {
  // Get the cover path from the query parameter (e.g., "manga-id/filename.jpg")
  const { path } = req.query;

  if (!path) {
    return res.status(400).send('Missing path parameter');
  }

  // Construct the full URL to the MangaDx cover server
  const imageUrl = `https://uploads.mangadex.org/covers/${path}`;

  try {
    // Fetch the image from the external server
    const imageResponse = await fetch(imageUrl);

    // If the image was not found, return a 404
    if (!imageResponse.ok) {
      return res.status(404).send('Cover not found');
    }

    // Get the image data as an array buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Set the correct content type
    res.setHeader('Content-Type', imageResponse.headers.get('Content-Type'));
    
    // Tell the browser it can cache this image for a long time
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Send the image data back to the browser
    res.status(200).send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Error proxying cover:', error);
    res.status(500).send('Error fetching cover');
  }
}