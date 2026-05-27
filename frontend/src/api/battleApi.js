import axios from 'axios';

const BASE_URL = "https://finetuning-areana-backend.onrender.com";

export async function validateModel(modelId) {
  try {
    const response = await axios.post(`${BASE_URL}/api/battle/validate-model`, {
      model_id: modelId
    });
    return response.data;
  } catch (error) {
    console.error("Error validating model:", error);
    return null;
  }
}

export async function generateTests(domain, count, difficulty, questionTypes) {
  try {
    const response = await axios.post(`${BASE_URL}/api/battle/generate-tests`, {
      domain,
      count,
      difficulty,
      question_types: questionTypes
    });
    return response.data;
  } catch (error) {
    console.error("Error generating tests:", error);
    return null;
  }
}

export async function runModels(modelAId, modelBId, question) {
  try {
    const response = await axios.post(`${BASE_URL}/api/battle/run-models`, {
      model_a_id: modelAId,
      model_b_id: modelBId,
      question
    });
    return response.data;
  } catch (error) {
    console.error("Error running models:", error);
    return null;
  }
}

export async function judgeRound(question, responseA, responseB, domain, expectedKeywords) {
  try {
    const response = await axios.post(`${BASE_URL}/api/battle/judge-round`, {
      question,
      response_a: responseA,
      response_b: responseB,
      domain,
      expected_keywords: expectedKeywords
    });
    return response.data;
  } catch (error) {
    console.error("Error judging round:", error);
    return null;
  }
}
