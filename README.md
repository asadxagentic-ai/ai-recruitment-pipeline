## Overview

This n8n workflow implements a complete AI-driven recruitment pipeline. It handles resume screening via ATS scoring, offers candidates a choice between text-based (25 questions) or voice-based (Vapi) interviews, conducts the interviews using AI agents, generates structured evaluation reports, and sends professional HTML emails to both HR and candidates. All AI processing uses LLMs (OpenAI GPT-3.5-turbo and Mistral models) via LangChain nodes.

## How It Works

1. **Webhook Entry** – Receives POST request at `/webhook/ai-recruiter` with candidate data (resume file, name, email, job title) and action type.
2. **PDF Extraction** – If a resume file is uploaded, extracts text content using the Extract From File node.
3. **ATS Screening** – An AI agent evaluates the resume against the target position, scoring 0-100 with detailed breakdown (skills, experience, education, strengths, weaknesses).
4. **Decision Gate** – Scores ≥60 proceed; below 60 receive automated rejection response.
5. **Interview Choice** – Accepted candidates receive a congratulations email and a webhook response offering two interview modes:
   - **Text Interview (UI_INTERVIEW)**: 25-question sequential chat via webhook, AI interviewer asks one question at a time.
   - **Voice Interview (VOICE_INTERVIEW)**: Triggers a Vapi.ai outbound call to the candidate's phone.
6. **Interview Execution** –
   - Text: Each candidate answer increments question count; AI interviewer acknowledges and asks next question.
   - Voice: Vapi handles the conversation; a separate webhook (`/webhook/vapi-interview-done`) receives the transcript and structured analysis when the call ends.
7. **Evaluation** – After 25 questions or voice completion, an AI agent evaluates the full transcript across 5 dimensions (technical, communication, problem-solving, behavioral, cultural fit) and outputs a structured JSON report.
8. **HR Report** – A formatted HTML email with score bars, recommendation badge, and detailed sections is sent to the HR email address.
9. **Final Decision** – Based on hiring recommendation (STRONG_HIRE/HIRE/BORDERLINE vs NO_HIRE), a final selection or rejection email is sent to the candidate, and a concluding webhook response is returned.

## Nodes & Tools Used

| Category | Nodes |
|---|---|
| **Triggers** | Webhook (ai-recruiter), Webhook (vapi-interview-done) |
| **Flow Control** | If (Resume or Interview?), If (ATS Accept or Reject?), If (Interview Complete?), If (Has PDF File?), If (Selected or Rejected?), Switch (Route Interview Type) |
| **AI Agents (LangChain)** | ATS Resume Screener, Generate Evaluation Report, AI Interview Conductor, Write ATS Pass Congrats Email, Write Final Selection Email, Format HR Evaluation Report |
| **Output Parsing** | Structured Output Parser (Evaluation Parser) |
| **Code/Transform** | Inject PDF Text into resumeText, Parse ATS Score, Parse Evaluation Data, Parse Vapi Interview Result, Build Interview Reply, Bridge Vapi Data to Evaluator |
| **Communication** | Gmail (Send ATS Pass Congrats Email, Send Final Selection Email, Email Eval Report to HR), HTTP Request (Create Vapi Call), Respond to Webhook (multiple) |
| **File Processing** | Extract From File (PDF text extraction) |
| **LLM Providers** | OpenAI Chat Model (gpt-3.5-turbo), Mistral Cloud Chat Model (ministral-3b-latest, ministral-3b-2512) |
| **Utilities** | Sticky Notes (documentation) |

## Prerequisites

- **n8n** (self-hosted or cloud) with the following nodes available:
  - Core: Webhook, If, Switch, Code, Set, Respond to Webhook, Extract From File, HTTP Request, Gmail
  - LangChain: Agent, Structured Output Parser, OpenAI Chat Model, Mistral Cloud Chat Model
- **API Credentials** configured in n8n:
  - OpenAI API key (for GPT-3.5-turbo)
  - Mistral Cloud API key (for ministral models)
  - Gmail OAuth2 credentials (for sending emails)
  - Vapi.ai API key and Assistant ID (for voice interviews)
- **Vapi.ai Account** with a configured voice assistant (assistant ID required in the Create Vapi Call node)
- **Phone Number** purchased/configured in Vapi for outbound calls

## Setup & Usage

1. **Import the Workflow**
   - In n8n, go to Workflows → Import → select the JSON file.
   - The workflow will appear as "AI Recruiter - Dual Interview Mode (Text UI + Voice Vapi)".

2. **Configure Credentials**
   - Open each node showing "REPLACE_WITH_YOUR_CREDENTIAL_ID" and assign your saved credentials:
     - OpenAI Chat Model → OpenAI API
     - Mistral Cloud Chat Model nodes → Mistral Cloud API
     - Gmail nodes → Gmail OAuth2
     - Create Vapi Call → Add your Vapi Authorization header (Bearer token)

3. **Update Static Configuration**
   - **Create Vapi Call node**: Replace `assistantId` with your Vapi assistant ID.
   - **Email Eval Report to HR**: Change `sendTo` from `m.asadullah95e@gmail.com` to your HR email.
   - **Vapi Webhook URL**: Ensure your Vapi assistant's "Server URL" points to `https://your-n8n-domain/webhook/vapi-interview-done`.

4. **Activate the Workflow**
   - Click "Activate" in the top-right. The webhook endpoints become live.

5. **Test the Pipeline**
   - POST to `https://your-n8n-domain/webhook/ai-recruiter` with JSON body:
   
   {
     "action": "SCORE_RESUME",
     "candidateName": "Jane Doe",
     "candidateEmail": "jane@example.com",
     "candidatePhone": "+15551234567",
     "jobTitle": "Senior Software Engineer",
     "resumeText": "...resume content..."
   }
   
   - Or upload a PDF via multipart form-data with field `resumeFile`.

## Use Cases

- **Recruiting Agencies**: Automate first-round screening and interviews at scale.
- **Internal HR Teams**: Reduce manual phone screens; standardize evaluation criteria.
- **High-Volume Hiring**: Process hundreds of applicants with consistent AI-driven scoring.
- **Remote-First Companies**: Voice interviews via Vapi provide a personal touch without scheduling overhead.
- **Developer Hiring**: Technical competency evaluation tailored to the job description.

---

*Built with n8n, LangChain, OpenAI, Mistral, and Vapi.ai*