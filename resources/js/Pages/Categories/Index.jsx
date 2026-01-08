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
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function CategoriesIndex({ categories }) {
    const { t } = useContext(AppContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        name_ar: '',
        description: '',
    });

    const openCreateDialog = () => {
        reset();
        setEditingCategory(null);
        setDialogOpen(true);
    };

    const openEditDialog = (category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            name_ar: category.name_ar || '',
            description: category.description || '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    toast.success(t('Catégorie mise à jour avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la mise à jour')),
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    toast.success(t('Catégorie créée avec succès'));
                    setDialogOpen(false);
                },
                onError: () => toast.error(t('Erreur lors de la création')),
            });
        }
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('categories.destroy', categoryToDelete.id), {
            onSuccess: () => toast.success(t('Catégorie supprimée avec succès')),
            onError: () => toast.error(t('Erreur: cette catégorie contient des produits')),
        });
    };

    return (
        <Layout
            title={t('Catégories')}
            breadcrumbs={[{ label: t('Catégories') }]}
        >
            <Head title={t('Catégories')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Gestion des catégories')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                >
                    {t('Nouvelle catégorie')}
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('Nom')}</TableCell>
                            <TableCell>{t('Nom (arabe)')}</TableCell>
                            <TableCell>{t('Description')}</TableCell>
                            <TableCell>{t('Produits')}</TableCell>
                            <TableCell align="right">{t('Actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories?.length > 0 ? (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{category.name}</Typography>
                                    </TableCell>
                                    <TableCell dir="rtl">{category.name_ar || '-'}</TableCell>
                                    <TableCell>{category.description || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={category.products_count || 0}
                                            size="small"
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => openEditDialog(category)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(category)}
                                            color="error"
                                            disabled={category.products_count > 0}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    {t('Aucune catégorie trouvée')}
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
                        {editingCategory ? t('Modifier catégorie') : t('Nouvelle catégorie')}
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
                                label={t('Nom (arabe)')}
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                fullWidth
                                dir="rtl"
                            />
                            <TextField
                                label={t('Description')}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                multiline
                                rows={2}
                                fullWidth
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
                title={t('Supprimer catégorie')}
                message={t('Êtes-vous sûr de vouloir supprimer cette catégorie ?')}
            />
        </Layout>
    );
}
