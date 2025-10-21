import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../prisma';
const router = Router();
// GET /certificate - Générer et télécharger le certificat
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('[CERTIFICATE] Generating certificate for user', req.userId);
        // Vérifier que l'utilisateur a complété tous les modules
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { progress: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const allModulesCompleted = user.progress.every(p => p.validated);
        if (!allModulesCompleted) {
            return res.status(403).json({ error: 'All modules must be completed to get certificate' });
        }
        // Créer le document PDF
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        // Headers pour le téléchargement
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Vibenengineer_Certificate_${user.email}.pdf`);
        // Pipe le PDF vers la réponse
        doc.pipe(res);
        // === Design du certificat ===
        // Bordure
        doc
            .lineWidth(3)
            .strokeColor('#00D9FF')
            .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
            .stroke();
        doc
            .lineWidth(1)
            .strokeColor('#A855F7')
            .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
            .stroke();
        // Titre
        doc
            .font('Helvetica-Bold')
            .fontSize(48)
            .fillColor('#00D9FF')
            .text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center' });
        // Ligne décorative
        doc
            .moveTo(200, 150)
            .lineTo(doc.page.width - 200, 150)
            .strokeColor('#A855F7')
            .lineWidth(2)
            .stroke();
        // Texte principal
        doc
            .font('Helvetica')
            .fontSize(16)
            .fillColor('#666666')
            .text('This is to certify that', 0, 200, { align: 'center' });
        // Nom de l'utilisateur (email)
        doc
            .font('Helvetica-Bold')
            .fontSize(36)
            .fillColor('#00D9FF')
            .text(user.email, 0, 240, { align: 'center' });
        // Texte de certification
        doc
            .font('Helvetica')
            .fontSize(16)
            .fillColor('#666666')
            .text('has successfully completed the', 0, 300, { align: 'center' });
        doc
            .font('Helvetica-Bold')
            .fontSize(32)
            .fillColor('#A855F7')
            .text('VIBEENENGINEER', 0, 340, { align: 'center' });
        doc
            .font('Helvetica')
            .fontSize(16)
            .fillColor('#666666')
            .text('training program', 0, 385, { align: 'center' });
        // Description
        doc
            .font('Helvetica')
            .fontSize(12)
            .fillColor('#888888')
            .text('Demonstrating proficiency in Foundations of Vibeenengineering,\nSystems & Signals, and Applied Flows', 0, 430, { align: 'center' });
        // Date
        const completionDate = new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        doc
            .font('Helvetica')
            .fontSize(12)
            .fillColor('#666666')
            .text(`Date of Completion: ${completionDate}`, 0, 500, { align: 'center' });
        // Signature
        doc
            .moveTo(150, 540)
            .lineTo(350, 540)
            .strokeColor('#333333')
            .lineWidth(1)
            .stroke();
        doc
            .font('Helvetica-Oblique')
            .fontSize(10)
            .fillColor('#888888')
            .text('Vibenen Academy', 150, 550, { width: 200, align: 'center' });
        // Footer
        doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#AAAAAA')
            .text('© Vibenen Academy - Certification authentique', 0, doc.page.height - 60, { align: 'center' });
        // Finaliser le PDF
        doc.end();
        console.log('[CERTIFICATE] Certificate generated successfully for', user.email);
    }
    catch (error) {
        console.error('[CERTIFICATE] Error generating certificate:', error);
        res.status(500).json({ error: 'Failed to generate certificate' });
    }
});
export default router;
