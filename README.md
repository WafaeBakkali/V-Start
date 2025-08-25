# V-Start: A Toolkit for Veo Prompting and Evaluation

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

V-Start is an experimental toolkit that helps users easily and quickly create effective prompts for Veo and evaluate how well generated videos align with their intended prompts. The main goal is to simplify the process of creating high-quality videos with Veo.

<img src="./data/V-Start.png" alt="V-Start Application Screenshot" width="700">

## ✨ Features

V-Start is divided into two main categories: Prompting and Evaluation.

### Prompting Tools
* **Prompt Generator**: Generate expert-level prompts based on [the ideal structure for Veo](https://medium.com/google-cloud/veo-3-a-detailed-prompting-guide-867985b46018), with support for both Text-to-Video and Image-to-Video and options for short or long outputs. For Image-to-Video, a base description is automatically generated from the uploaded image, which can then be customized.
* **Prompt Enhancer**: Improve an existing prompt by leveraging Gemini to enhance its cinematic detail and effectiveness.
* **Prompt Converter**: Convert prompts between different formats, such as Plain Text, JSON, YAML or XML.
* **Timeline Prompting**: Create multi-shot scenes by sequencing multiple prompts, defining the start and end times for each action to build a detailed narrative.
* **Gallery**: Explore a curated library of high-quality video examples and copy their prompts for inspiration.

### Evaluation Tools
* **Alignment Eval**: An autorater that provides an objective score (0-100%) of how well a video matches its prompt. You can evaluate a single prompt-video pair or process multiple pairs in bulk by pasting data directly into the tool or uploading a CSV file from your local machine. The tool works by breaking the prompt into sub-questions, and Gemini uses its Visual Question Answering (VQA) capabilities to score the video's alignment. All results can be stored for further analysis.
* **Side-by-Side Comparison**: Compare videos side-by-side to gather human feedback. Participate in existing studies (like prompt format evaluation) or create your own for qualitative evaluation. Results can be stored for further analysis.

## 🛠️ Tech Stack

* **Backend**: Node.js with Express.js
* **Frontend**: HTML, CSS, and modern vanilla JavaScript (ES modules)
* **Styling**: Tailwind CSS (via CDN) with a custom dark mode theme.
* **Core AI**: Google Gemini API (specifically `gemini-2.5-pro`)
* **Deployment**: The application also includes a `Dockerfile` for containerization.

## 📂 Project Structure

The repository is organized as follows:

<img src="./data/repo.png" alt="V-Start Project Structure" width="700">

## 🚀 Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)
* npm (usually comes with Node.js)
* A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd V-Start
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env` in the root of the project by copying the example file.
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your Gemini API Key.

4.  **Run the server:**
    ```bash
    npm start
    ```

5.  Open your browser and navigate to `http://localhost:8080`.

## ☁️ Deployment to Cloud Run

The recommended way to deploy this application is directly from source to Google Cloud Run, secured with Identity-Aware Proxy (IAP). When you deploy from source, Cloud Build automatically uses the `Dockerfile` in your repository to build and deploy your container.

### Prerequisites

* A Google Cloud Project with billing enabled.
* The [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI) installed and authenticated.

### Step 1: Project Setup (One-Time)

Run these commands to set your project and enable the necessary APIs.
```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# Enable required services
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com iap.googleapis.com