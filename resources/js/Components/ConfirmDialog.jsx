import { useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { AppContext } from '../app';

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    severity = 'warning',
}) {
    const { t } = useContext(AppContext);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {severity === 'warning' && <WarningIcon color="warning" />}
                {title || t('Confirmation')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {message || t('Êtes-vous sûr de vouloir effectuer cette action ?')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    {cancelText || t('Annuler')}
                </Button>
                <Button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    color={severity === 'warning' ? 'error' : 'primary'}
                    variant="contained"
                    autoFocus
                >
                    {confirmText || t('Confirmer')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
