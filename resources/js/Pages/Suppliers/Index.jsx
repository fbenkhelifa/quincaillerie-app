import { useContext, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    FormControlLabel,
    Switch,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function SuppliersIndex({ suppliers }) {
    const { t } = useContext(AppContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true,
    });

    const openCreateDialog = () => {
        reset();
        setEditingSupplier(null);
        setDialogOpen(true);
    };

    const openEditDialog = (supplier) => {
        setEditingSupplier(supplier);
        setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
            is_active: supplier.is_active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            put(route('suppliers.update', editingSupplier.id), {
                onSuccess: () => {
                    toast.success(t('Fournisseur mis à jour avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la mise à jour')),
            });
        } else {
            post(route('suppliers.store'), {
                onSuccess: () => {
                    toast.success(t('Fournisseur créé avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la création')),
            });
        }
    };

    const handleDelete = (supplier) => {
        setSupplierToDelete(supplier);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('suppliers.destroy', supplierToDelete.id), {
            onSuccess: () => toast.success(t('Fournisseur supprimé avec succès')),
            onError: () => toast.error(t('Erreur: ce fournisseur a des produits associés')),
        });
    };

    return (
        <Layout
            title={t('Fournisseurs')}
            breadcrumbs={[{ label: t('Fournisseurs') }]}
        >
            <Head title={t('Fournisseurs')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Gestion des fournisseurs')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                >
                    {t('Nouveau fournisseur')}
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Nom')}</TableCell>
                            <TableCell>{t('Contact')}</TableCell>
                            <TableCell>{t('Téléphone')}</TableCell>
                            <TableCell>{t('Email')}</TableCell>
                            <TableCell>{t('Produits')}</TableCell>
                            <TableCell>{t('Statut')}</TableCell>
                            <TableCell align="right">{t('Actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {suppliers?.length > 0 ? (
                            suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{supplier.name}</Typography>
                                    </TableCell>
                                    <TableCell>{supplier.contact_person || '-'}</TableCell>
                                    <TableCell>{supplier.phone || '-'}</TableCell>
                                    <TableCell>{supplier.email || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={supplier.products_count || 0}
                                            size="small"
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={supplier.is_active ? t('Actif') : t('Inactif')}
                                            size="small"
                                            color={supplier.is_active ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => openEditDialog(supplier)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(supplier)}
                                            color="error"
                                            disabled={supplier.products_count > 0}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {t('Aucun fournisseur trouvé')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingSupplier ? t('Modifier fournisseur') : t('Nouveau fournisseur')}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label={t('Nom')}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                                required
                            />
                            <TextField
                                label={t('Personne de contact')}
                                value={data.contact_person}
                                onChange={(e) => setData('contact_person', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={t('Téléphone')}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={t('Email')}
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={t('Adresse')}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                multiline
                                rows={2}
                                fullWidth
                            />
                            <TextField
                                label={t('Notes')}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                multiline
                                rows={2}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label={t('Actif')}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} color="inherit">
                            {t('Annuler')}
                        </Button>
                        <Button type="submit" variant="contained" disabled={processing}>
                            {t('Enregistrer')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={t('Supprimer fournisseur')}
                message={t('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')}
            />
        </Layout>
    );
}
