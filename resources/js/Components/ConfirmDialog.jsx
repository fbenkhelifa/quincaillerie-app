/**
 * ConfirmDialog Component
 * =======================
 * Enhanced confirmation dialog with severity variants and icons.
 */

import { useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { AppContext } from '../app';

const severityConfig = {
    warning: {
        icon: WarningIcon,
        color: 'warning',
        buttonColor: 'warning',
    },
    error: {
        icon: ErrorIcon,
        color: 'error',
        buttonColor: 'error',
    },
    danger: {
        icon: DeleteIcon,
        color: 'error',
        buttonColor: 'error',
    },
    info: {
        icon: InfoIcon,
        color: 'info',
        buttonColor: 'primary',
    },
    success: {
        icon: SuccessIcon,
        color: 'success',
        buttonColor: 'success',
    },
};

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    severity = 'warning',
    loading = false,
}) {
    const { t } = useContext(AppContext) || { t: (key) => key };
    const theme = useTheme();
    
    const config = severityConfig[severity] || severityConfig.warning;
    const Icon = config.icon;

    const handleConfirm = () => {
        onConfirm();
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={loading ? undefined : onClose} 
            maxWidth="xs" 
            fullWidth
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <DialogTitle 
                id="confirm-dialog-title"
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    pb: 1,
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette[config.color].main, 0.1),
                    }}
                >
                    <Icon sx={{ color: `${config.color}.main`, fontSize: 24 }} />
                </Box>
                {title || t('Confirmation')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description" sx={{ color: 'text.secondary' }}>
                    {message || t('Êtes-vous sûr de vouloir effectuer cette action ?')}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button 
                    onClick={onClose} 
                    color="inherit" 
                    disabled={loading}
                    sx={{ minWidth: 100 }}
                >
                    {cancelText || t('Annuler')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    color={config.buttonColor}
                    variant="contained"
                    autoFocus
                    disabled={loading}
                    sx={{ minWidth: 100 }}
                >
                    {loading ? t('Chargement...') : (confirmText || t('Confirmer'))}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
