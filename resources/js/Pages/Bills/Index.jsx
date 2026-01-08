import { useContext, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { AppContext } from '../../app';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    InputAdornment,
    TablePagination,
    IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

export default function BillsIndex({ bills, filters }) {
    const { t, locale } = useContext(AppContext);
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status: filters.status || '',
        payment_method: filters.payment_method || '',
        date_from: filters.date_from ? dayjs(filters.date_from) : null,
        date_to: filters.date_to ? dayjs(filters.date_to) : null,
    });

    const handleFilter = () => {
        const params = {};
        if (localFilters.search) params.search = localFilters.search;
        if (localFilters.status) params.status = localFilters.status;
        if (localFilters.payment_method) params.payment_method = localFilters.payment_method;
        if (localFilters.date_from) params.date_from = localFilters.date_from.format('YYYY-MM-DD');
        if (localFilters.date_to) params.date_to = localFilters.date_to.format('YYYY-MM-DD');
        
        router.get(route('bills.index'), params, { preserveState: true });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
            minimumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const statusColors = {
        pending: 'warning',
        completed: 'success',
        cancelled: 'error',
    };

    const statusLabels = {
        pending: t('En attente'),
        completed: t('Terminée'),
        cancelled: t('Annulée'),
    };

    const paymentMethodLabels = {
        cash: t('Espèces'),
        card: t('Carte'),
        check: t('Chèque'),
        credit: t('Crédit'),
        other: t('Autre'),
    };

    return (
        <Layout
            title={t('Factures')}
            breadcrumbs={[{ label: t('Factures') }]}
        >
            <Head title={t('Factures')} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    {t('Gestion des factures')}
                </Typography>
                <Button
                    component={Link}
                    href={route('bills.create')}
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    {t('Nouvelle facture')}
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        placeholder={t('Rechercher...')}
                        value={localFilters.search}
                        onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 200 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>{t('Statut')}</InputLabel>
                        <Select
                            value={localFilters.status}
                            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                            label={t('Statut')}
                        >
                            <MenuItem value="">{t('Tous')}</MenuItem>
                            <MenuItem value="pending">{t('En attente')}</MenuItem>
                            <MenuItem value="completed">{t('Terminée')}</MenuItem>
                            <MenuItem value="cancelled">{t('Annulée')}</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>{t('Paiement')}</InputLabel>
                        <Select
                            value={localFilters.payment_method}
                            onChange={(e) => setLocalFilters({ ...localFilters, payment_method: e.target.value })}
                            label={t('Paiement')}
                        >
                            <MenuItem value="">{t('Tous')}</MenuItem>
                            <MenuItem value="cash">{t('Espèces')}</MenuItem>
                            <MenuItem value="card">{t('Carte')}</MenuItem>
                            <MenuItem value="check">{t('Chèque')}</MenuItem>
                            <MenuItem value="credit">{t('Crédit')}</MenuItem>
                        </Select>
                    </FormControl>
                    <DatePicker
                        label={t('Du')}
                        value={localFilters.date_from}
                        onChange={(value) => setLocalFilters({ ...localFilters, date_from: value })}
                        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                    />
                    <DatePicker
                        label={t('Au')}
                        value={localFilters.date_to}
                        onChange={(value) => setLocalFilters({ ...localFilters, date_to: value })}
                        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                    />
                    <Button variant="contained" onClick={handleFilter}>
                        {t('Filtrer')}
                    </Button>
                </Box>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('N° Facture')}</TableCell>
                            <TableCell>{t('Client')}</TableCell>
                            <TableCell>{t('Vendeur')}</TableCell>
                            <TableCell align="right">{t('Total')}</TableCell>
                            <TableCell>{t('Paiement')}</TableCell>
                            <TableCell>{t('Statut')}</TableCell>
                            <TableCell>{t('Date')}</TableCell>
                            <TableCell align="right">{t('Actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bills.data?.length > 0 ? (
                            bills.data.map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{bill.bill_number}</Typography>
                                    </TableCell>
                                    <TableCell>{bill.customer_name || '-'}</TableCell>
                                    <TableCell>{bill.worker?.name || '-'}</TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="bold" color="primary">
                                            {formatCurrency(bill.total)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={paymentMethodLabels[bill.payment_method]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={statusLabels[bill.status]}
                                            size="small"
                                            color={statusColors[bill.status]}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(bill.created_at).toLocaleDateString(
                                            locale === 'ar' ? 'ar-DZ' : 'fr-FR',
                                            { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={Link}
                                            href={route('bills.show', bill.id)}
                                            size="small"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton
                                            component="a"
                                            href={route('bills.pdf', { bill: bill.id, lang: locale })}
                                            size="small"
                                            color="error"
                                        >
                                            <PdfIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    {t('Aucune facture trouvée')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {bills.total > bills.per_page && (
                    <TablePagination
                        component="div"
                        count={bills.total}
                        page={bills.current_page - 1}
                        onPageChange={(e, page) =>
                            router.get(route('bills.index'), { ...filters, page: page + 1 }, { preserveState: true })
                        }
                        rowsPerPage={bills.per_page}
                        rowsPerPageOptions={[bills.per_page]}
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} ${t('sur')} ${count}`
                        }
                    />
                )}
            </TableContainer>
        </Layout>
    );
}
