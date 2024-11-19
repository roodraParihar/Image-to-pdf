document.getElementById('fileInput').addEventListener('change', handleFileSelect);
const generatePdfButton = document.getElementById('generatePdf');
const previewContainer = document.getElementById('preview');
const pdfPreviewContainer = document.getElementById('pdfPreview');
const pdfFrame = document.getElementById('pdfFrame');
const downloadPdfButton = document.getElementById('downloadPdf');
const status = document.getElementById('status');

let images = []; // Array to hold selected images

function handleFileSelect(event) {
    const files = event.target.files;

    // Loop through selected files
    Array.from(files).forEach(file => {
        if (!images.find(img => img.name === file.name)) {
            // Avoid duplicate entries based on filename
            images.push(file);

            const reader = new FileReader();
            reader.onload = function(e) {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-wrapper';

                const imgElement = document.createElement('img');
                imgElement.src = e.target.result;

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.innerText = '×';

                // Remove image from UI and array on delete
                deleteButton.onclick = () => {
                    images = images.filter(img => img !== file);
                    imgWrapper.remove();
                    if (images.length === 0) {
                        generatePdfButton.classList.add('hidden');
                    }
                };

                imgWrapper.appendChild(imgElement);
                imgWrapper.appendChild(deleteButton);
                previewContainer.appendChild(imgWrapper);
            };
            reader.readAsDataURL(file);
        }
    });

    if (images.length > 0) {
        generatePdfButton.classList.remove('hidden');
    }
}

generatePdfButton.onclick = function() {
    generatePDF(images);
};

function generatePDF(files) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let completedImages = 0; // Track completed images for asynchronous processing

    files.forEach((file, index) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = function() {
            if (index > 0) {
                doc.addPage();
            }

            // Add image to PDF
            doc.addImage(img, 'JPEG', 10, 10, 190, 160);

            completedImages++;
            if (completedImages === files.length) {
                // Generate PDF after all images are processed
                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);

                pdfFrame.src = pdfUrl;
                pdfPreviewContainer.classList.remove('hidden');

                downloadPdfButton.onclick = function() {
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = 'images-to-pdf.pdf';
                    link.click();
                };

                status.textContent = 'PDF generated successfully!';
            }
        };
    });
}
