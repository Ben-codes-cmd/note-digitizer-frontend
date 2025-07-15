document.addEventListener('DOMContentLoaded', () => {

    // Copy Shortcut
    document.getElementById('copy').addEventListener('click', (event) => {
        navigator.clipboard.writeText(document.getElementById("output").textContent);
    });

    // File Selection
    document.getElementById('file').addEventListener('change', (event) => {
        document.getElementById('selectedFile').textContent = `${event.target.files[0].name} \u2713`;
    });

    // File Submission
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
                // use key to create polling entry
                let card = document.createElement('p');
                card.textContent = FileInput.files[0].name;
                card.classList.add("cursor-pointer");
                card.dataset.poll = "true";
                card.addEventListener('click', async function (event) {
                    const key = data.fields.key;
                    const output = document.getElementById("output");
                    // make polling request
                    if(event.target.dataset.poll === "true"){
                        const pollResponse = await fetch(`https://7y3hagl18l.execute-api.us-east-2.amazonaws.com/dev/poll?key=${key}`, {method: 'GET'})
                        console.log(pollResponse);
                        const body = await pollResponse.json();
                        switch(pollResponse.status){
                            case 200:
                                output.textContent = body.data;
                                localStorage.setItem(key, body.data);
                                card.dataset.poll = "false";
                                break;
                            case 201:
                                output.textContent = "PROCESSING, please try again";
                                break;
                            case 202:
                                output.textContent = `FAILURE: ${body.data}`;
                                localStorage.setItem(key, `FAILURE: ${body.data}`);
                                card.dataset.poll = "false";
                                break;
                            case 404:
                                output.textContent = "JOB NOT FOUND";
                                localStorage.setItem(key, "JOB NOT FOUND");
                                card.dataset.poll = "false";
                                break;
                            case 500:
                                output.textContent = body.data;
                                localStorage.setItem(key, body.data);
                                card.dataset.poll = "false";
                                break;
                        }
                    }else{
                        // fetch from local storage
                        output.textContent = localStorage.getItem(key);
                    }
                });
                document.getElementById('jobs').append(card);
                event.target.reset();
                document.getElementById('selectedFile').textContent = "None Selected";
            }else{
                //update frontend with error message
                console.log("Failed to upload the image to s3 bucket.")
                const err = await s3Response.text();
                console.log(err);
            }
            
        } catch (error) {
            console.error('Error: ', error);
        }
    });

});