import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Transaction, User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Loader, Printer, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function InvoiceDetailsPage() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('id');

  const [transaction, setTransaction] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const invoiceRef = useRef();

  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      return;
    }
    const loadInvoiceData = async () => {
      try {
        const [transData, userData] = await Promise.all([
          Transaction.get(transactionId),
          User.me()
        ]);
        setTransaction(transData);
        setUser(userData);
      } catch (error) {
        console.error("Failed to load invoice data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInvoiceData();
  }, [transactionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!transaction || !user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold">Invoice not found</h2>
        <p className="text-gray-600">The requested invoice could not be loaded.</p>
        <Link to={createPageUrl('AccountSettings?view=billing')}>
          <Button className="mt-4">Back to Billing</Button>
        </Link>
      </div>
    );
  }

  const isDriverInvoice = transaction.type === 'payment';
  const serviceFee = isDriverInvoice ? transaction.amount * 0.15 : 0;
  const hostEarnings = isDriverInvoice ? transaction.amount - serviceFee : transaction.amount;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Link to={createPageUrl('AccountSettings?view=billing')}>
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Billing</Button>
          </Link>
          <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print Invoice</Button>
        </div>

        <div ref={invoiceRef} className="bg-white p-8 sm:p-12 rounded-lg shadow-lg border">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
              <p className="text-gray-500">Invoice #: {transaction.invoice_number}</p>
              <p className="text-gray-500">Date: {format(new Date(transaction.created_date), 'MMMM d, yyyy')}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-2xl font-semibold text-blue-600">
                <Zap /> ChargePeer
              </div>
              <p className="text-gray-500 text-sm">contact@chargepeer.com</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-500 uppercase text-sm mb-2">Billed To</h3>
              <p className="font-medium text-gray-800">{user.full_name}</p>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">{user.address}</p>
            </div>
            <div className="sm:text-right">
              <h3 className="font-semibold text-gray-500 uppercase text-sm mb-2">
                {isDriverInvoice ? 'Charged By' : 'Payment From'}
              </h3>
              <p className="font-medium text-gray-800">{transaction.related_user_name}</p>
              <p className="text-gray-600">{isDriverInvoice ? 'ChargePeer Host' : 'ChargePeer Driver'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 uppercase text-sm">
                <th className="p-3 font-semibold">Description</th>
                <th className="p-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">
                  <p className="font-medium">{isDriverInvoice ? "Charging Session Cost" : "Host Payout"}</p>
                  <p className="text-sm text-gray-500">{transaction.charger_title}</p>
                  <p className="text-xs text-gray-400">Booking ID: {transaction.booking_id}</p>
                </td>
                <td className="p-3 text-right">₹{isDriverInvoice ? transaction.amount.toFixed(2) : hostEarnings.toFixed(2)}</td>
              </tr>
              {isDriverInvoice && (
                <tr className="border-b">
                  <td className="p-3">
                    <p className="font-medium">Service Fee</p>
                    <p className="text-sm text-gray-500">15% platform commission</p>
                  </td>
                  <td className="p-3 text-right">- ₹{serviceFee.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{isDriverInvoice ? transaction.amount.toFixed(2) : hostEarnings.toFixed(2)}</span>
              </div>
              {isDriverInvoice &&
                <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Service Fee</span>
                    <span>- ₹{serviceFee.toFixed(2)}</span>
                </div>
              }
              <div className="flex justify-between py-3 font-bold text-lg">
                <span className="text-gray-900">{isDriverInvoice ? 'Net Payable' : 'Net Received'}</span>
                <span className="text-blue-600">₹{hostEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
            <p>Thank you for using ChargePeer!</p>
            <p>If you have any questions about this invoice, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}