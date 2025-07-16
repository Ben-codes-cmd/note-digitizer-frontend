# Image to Text Converter

<img height="500" alt="Diagram" src="https://github.com/user-attachments/assets/dd31d737-da78-4354-a399-ba250b3ee5b4" /> <br>
[Technical Demo](https://youtu.be/lEluBGsd_HU)

## Overview
This project provides users with an intuitive interface to upload images containing human readable text to be rapidly converted into a digital format for practical applications including but not limited to:
- Training LLMs
- Indexing Handwritten Data
- Archiving Physical Documents

## Architectural Decisions
To implement this project, I opted for a fullstack serverless web application powered by AWS.

To facilitate secure communication with the backend, I configured a REST API using AWS API Gateway to handle client requests.

In order to accommodate files larger than 5MB, I created an s3 bucket for users to upload files to with a presigned POST request. 

When images are uploaded, Lambda asynchronously executes jobs and updates a DynamoDB table with processed data.

Finally, a polling endpoint allows users to fetch and display completed jobs.
