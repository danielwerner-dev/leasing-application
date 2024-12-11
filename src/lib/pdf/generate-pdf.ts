import fs from 'fs';
import path from 'path';
import pdfGenerator from 'html-pdf';
import { fillTemplateValues } from '$lib/pdf/templates';

export const generateApplicationPdf = async (application) => {
  process.env.PATH = `${process.env.PATH}:/opt`;
  process.env.FONTCONFIG_PATH = '/opt';
  process.env.LD_LIBRARY_PATH = '/opt';

  const template = fs.readFileSync(
    path.resolve(__dirname, './assets/ApplicationSummaryTemplate.html'),
    'utf8'
  );
  const html = fillTemplateValues(template, application);
  return await generatePdf(html);
};

export const generatePdf = async (html: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    pdfGenerator
      .create(html, {
        format: 'A4',
        orientation: 'portrait',
        type: 'pdf',
        border: {
          top: '15mm',
          bottom: '10mm',
          left: '0',
          right: '0'
        },
        /*
        TODO: This option was added in the version 3.x. Default value is false, to fix a security issue
        https://github.com/marcbachmann/node-html-pdf/pull/616
        however the following error is introduced:
        https://stackoverflow.com/questions/68787550/cannot-read-property-filename-of-undefined-using-html-pdf-with-lambda
        The other option is to downgrade to version 2.2.0, but the dependabot's alert will be back again.
        */
        localUrlAccess: true,

        // This is the path for compiled phantomjs executable stored in layer.
        // To test locally comment out the following lines.
        phantomPath: '/opt/phantomjs_linux-x86_64',
        script: '/opt/scripts/pdf_a4_portrait.js'

        // phantomPath: './node_modules/phantomjs-prebuilt/bin/phantomjs',
        // script: './node_modules/html-pdf/lib/scripts/pdf_a4_portrait.js'
      })
      .toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        }
        // To test locally uncomment
        // fs.writeFileSync('output.pdf', buffer);
        resolve(buffer.toString('base64'));
      });
  });
};
