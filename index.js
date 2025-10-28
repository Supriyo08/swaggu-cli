#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ora from 'ora';
import fs from 'fs/promises';

/**
 * Initializes and returns the Gemini Pro model.
 * Checks for the API key in environment variables and exits if not found.
 */
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(chalk.red.bold('Error: GEMINI_API_KEY environment variable is not set.'));
    console.log(chalk.yellow('Please get an API key from Google AI Studio and set it:'));
    console.log(chalk.blue('  export GEMINI_API_KEY="YOUR_API_KEY_HERE"'));
    process.exit(1); // Exit the script with an error code
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

/**
 * Reads data from standard input (stdin), for piped commands.
 * @returns {Promise<string>} The data piped into the command.
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

/**
 * Calls the Gemini API with a formatted prompt.
 * @param {string} prompt - The user's prompt.
 * @param {string} [language] - Optional language hint.
 * @returns {Promise<string>} The generated code text.
 */
async function callGemini(prompt, language) {
  const model = getGeminiModel();
  const spinner = ora(chalk.blue('Sending prompt to Gemini...')).start();

  try {
    let systemPrompt = `You are an expert code generation assistant. 
You will be given a prompt and must return ONLY the raw code snippet that satisfies the request. 
Do not add any explanations, conversational text, or markdown fences (like \`\`\`). Just the code.`;
    
    if (language) {
      systemPrompt += ` The user has specified the code should be in ${language}.`;
    }

    const fullPrompt = `${systemPrompt}\n\n--- USER REQUEST ---\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    spinner.succeed(chalk.green('Code generated successfully!'));
    return text;

  } catch (error) {
    spinner.fail(chalk.red.bold('Error generating code:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// --- Define the 'generate' Command ---

program
  .command('generate')
  .alias('g')
  .description('Generate code using the Gemini API')
  .argument('[prompt...]', 'The prompt for Gemini (joins all words)')
  .option('-i, --interactive', 'Run in interactive mode for a multi-line prompt')
  .option('-o, --output <file>', 'Save the generated code to a file')
  .option('-l, --language <lang>', 'Specify the coding language (e.g., "javascript", "python")')
  .action(async (promptWords, options) => {
    
    let prompt = promptWords.join(' ');
    const isPiped = !process.stdin.isTTY;

    // --- Robust Prompt Handling Logic ---
    if (prompt) {
      // 1. Prompt was provided as a direct argument
      // Do nothing, prompt is already set
    } else if (isPiped) {
      // 2. Prompt is being piped in
      prompt = await readStdin();
    } else if (options.interactive) {
      // 3. User requested interactive mode
      const answers = await inquirer.prompt([
        {
          type: 'editor', // 'editor' opens $EDITOR for a great multi-line experience
          name: 'prompt',
          message: 'Enter your code prompt (press Esc then Enter to finish):',
          validate: (input) => input ? true : 'Prompt cannot be empty.',
        },
      ]);
      prompt = answers.prompt;
    } else {
      // 4. No prompt provided in any form
      console.error(chalk.red.bold('Error: No prompt provided.'));
      console.log(chalk.yellow('\nPlease provide a prompt, use -i for interactive mode, or pipe in a prompt.'));
      program.help(); // Show the help menu
      process.exit(1);
    }

    // --- Call the API ---
    const generatedCode = await callGemini(prompt, options.language);

    // --- Handle Output (File or Console) ---
    if (options.output) {
      const saveSpinner = ora(chalk.blue(`Saving code to ${options.output}...`)).start();
      try {
        await fs.writeFile(options.output, generatedCode);
        saveSpinner.succeed(chalk.green(`Successfully saved to ${options.output}`));
      } catch (error) {
        saveSpinner.fail(chalk.red.bold(`Error saving file:`));
        console.error(chalk.red(error.message));
      }
    } else {
      // Print to console
      console.log(chalk.cyan.bold('\n--- Generated Code ---'));
      console.log(generatedCode);
      console.log(chalk.cyan.bold('------------------------\n'));
    }
  });

// --- Final Parse ---
program.parse(process.argv);