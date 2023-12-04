import * as vscode from 'vscode';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('arxivcosmology.showArxivCosmology', async () => {
        const panel = vscode.window.createWebviewPanel(
            'arxivCosmology',
            'Cosmology Papers from arXiv',
            vscode.ViewColumn.One,
            {}
        );

        panel.webview.html = await getArxivPapers();
    });

    context.subscriptions.push(disposable);
}

async function getArxivPapers(): Promise<string> {
    try {
        const maxResults = 20; // Adjust this number as needed

        const response = await axios.get(`http://export.arxiv.org/api/query?search_query=cat:astro-ph.CO&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`);
        const result = await parseStringPromise(response.data, { explicitArray: false });

        let htmlContent = '<h1>Today\'s Cosmology Papers on arXiv</h1>';

        const entries = result.feed.entry;
        if (!entries) {
            htmlContent += '<p>No papers found.</p>';
            return htmlContent;
        }

        const entryArray = Array.isArray(entries) ? entries : [entries];
        entryArray.forEach(entry => {
            htmlContent += `
                <div style="margin-bottom: 20px;">
                    <p><a href="${entry.id}" target="_blank">${entry.title}</a> - ${entry.published}</p>
                    <p><strong>Abstract:</strong> ${entry.summary}</p>
                </div>`;
        });

        return htmlContent;
    } catch (error) {
        console.error('Error fetching arXiv papers:', error);
        return '<p>Error fetching papers. Please try again later.</p>';
    }
}

export function deactivate() {}

