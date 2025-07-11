document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('uploadForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        try {
            // gets presigned url
            const response = await fetch('https://7y3hagl18l.execute-api.us-east-2.amazonaws.com/dev/upload', {method: 'GET'});
            if(!response.ok){
                console.log("Failed to fetch presigned URL.")
                const err = await s3Response.text();
                console.log(err);
                return;
            }
            const data = await response.json();

            // Append the signed fields to the form
            const form = new FormData();
            Object.entries(data.fields).forEach(([key, value]) => {
                form.append(key, value);
            });

            // append the file to the form
            const FileInput = event.target.querySelector('input[type="file"]');
            form.append(FileInput.name, FileInput.files[0]);
            
            // submit the form to post image to s3 bucket
            const s3Response = await fetch(data.url, {
                method: "POST",
                body: form
            });
            if(s3Response.ok){
                console.log("Image Uploaded Successfully"); // Generate Frontend Card
            }else{
                console.log("Failed to upload the image to s3 bucket.")
                const err = await s3Response.text();
                console.log(err);
            }
            // use key to create polling entry
            
        } catch (error) {
            console.error('Error: ', error);
        }
    });

});