import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	Grid,
	TextField,
	InputAdornment,
	Chip,
	Button,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
} from '@mui/material';
import { Search as SearchIcon, Receipt as ReceiptIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import StudentLayout from '../../components/StudentLayout';
import { collegeFeeApi } from '../../api/collegeFeeApi';
import toast from 'react-hot-toast';

const StudentCollegeFees = () => {
	const [fees, setFees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [filterStatus, setFilterStatus] = useState('all');

	useEffect(() => {
		load();
	}, []);

	const load = async () => {
		try {
			setLoading(true);
			const { data } = await collegeFeeApi.getMyFees();
			setFees(data.result || []);
		} catch (e) {
			toast.error('Failed to load college fees');
		} finally {
			setLoading(false);
		}
	};

	const filtered = useMemo(() => {
		return (fees || []).filter((f) => {
			const matches = !search ||
				f?.student?.name?.toLowerCase?.().includes(search.toLowerCase()) ||
				f?.student?.registrationNumber?.toLowerCase?.().includes(search.toLowerCase());
			const statusOk = filterStatus === 'all' || f.status.toLowerCase() === filterStatus;
			return matches && statusOk;
		});
	}, [fees, search, filterStatus]);

	const statusChip = (status) => {
		switch (status) {
			case 'Paid':
				return <Chip color="success" icon={<CheckCircleIcon />} label="Paid" size="small" />;
			case 'Unpaid':
				return <Chip color="error" icon={<CancelIcon />} label="Unpaid" size="small" />;
			default:
				return <Chip label={status} size="small" />;
		}
	};

	const downloadReceipt = async (fee) => {
		if (fee.status !== 'Paid') {
			toast.error('Pay fees before downloading receipt');
			return;
		}
		try {
			const response = await collegeFeeApi.downloadReceipt(fee._id);
			const contentType = response?.headers?.['content-type'] || 'application/pdf';
			const dataIsBlob = response?.data instanceof Blob;
			const blob = dataIsBlob ? response.data : new Blob([response.data], { type: contentType });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `college-receipt-${fee._id}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			toast.error('Failed to download receipt');
		}
	};

	return (
		<StudentLayout title="My College Fees">
			<Box sx={{ p: 2 }}>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} md={6}>
						<TextField fullWidth placeholder="Search by name or registration" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						) }} />
					</Grid>
				</Grid>

				<Card sx={{ mt: 2 }}>
					<CardContent>
						{loading ? (
							<Typography>Loading...</Typography>
						) : (
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>Amount</TableCell>
										<TableCell>Due</TableCell>
										<TableCell>Status</TableCell>
										<TableCell align="right">Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{(filtered || []).map((f) => (
										<TableRow key={f._id} hover>
											<TableCell>₹{f.amount}</TableCell>
											<TableCell>{new Date(f.dueDate).toLocaleDateString()}</TableCell>
											<TableCell>{statusChip(f.status)}</TableCell>
											<TableCell align="right">
												<Button size="small" variant="outlined" onClick={() => downloadReceipt(f)} startIcon={<ReceiptIcon />} disabled={f.status !== 'Paid'}>
													Download Receipt
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</Box>
		</StudentLayout>
	);
};

export default StudentCollegeFees;


