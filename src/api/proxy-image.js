export default async function handler(req, res) {
  // Get the image URL from the query parameter
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    // Fetch the image from the external server
    const imageResponse = await fetch(url);

    // If the image was not found, return a 404
    if (!imageResponse.ok) {
      return res.status(404).send('Image not found');
    }

    // Get the image data as an array buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Set the correct content type (e.g., image/jpeg, image/png)
    res.setHeader('Content-Type', imageResponse.headers.get('Content-Type'));
    
    // Tell the browser it can cache this image for a long time
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Send the image data back to the browser
    res.send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).send('Error fetching image');
  }
}