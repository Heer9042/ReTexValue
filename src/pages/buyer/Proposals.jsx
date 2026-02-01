import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, CheckCircle, XCircle, Clock, ChevronRight, MessageSquare, AlertCircle, Send, Package, Calendar, DollarSign } from 'lucide-react';
import TenderTracker from '../../components/TenderTracker';

export default function BuyerProposals() {
  const { proposals, updateProposalStatus, user, initiatePayment, bulkRequests } = useApp();
  const [showNegotiate, setShowNegotiate] = useState(null);
  const [negotiationMsg, setNegotiationMsg] = useState('');
  const [activeTab, setActiveTab] = useState('received');

  const handleAcceptProposal = async (proposal) => {
    try {
        const paymentResult = await initiatePayment(proposal.totalPrice, {
           proposalId: proposal.id,
           factoryName: proposal.factoryName,
           description: `Bulk procurement from ${proposal.factoryName}`
        });

        if (paymentResult?.success) {
           await updateProposalStatus(proposal.id, 'Accepted');
           alert("Proposal accepted and payment verified! Transaction ID: " + paymentResult.paymentId);
        }
    } catch (err) {
        console.error("Acceptance protocol aborted", err);
        if (err.message !== "Payment cancelled") {
            alert("Payment failed: " + err.message);
        }
    }
  };

  // Filter for current buyer
  const myProposals = proposals.filter(p => p.buyerId === user?.id);
  const myBulkRequests = bulkRequests.filter(r => r.buyerId === user?.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
         <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Proposals & Requests</h1>
         <p className="text-slate-500 text-lg">Manage your bulk requests and received quotes from factories.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'requests'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Bulk Requests
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'received'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Received Proposals
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <TenderTracker requests={myBulkRequests} />

          {myBulkRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No bulk requests yet</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Create your first bulk request to connect with verified factories and receive competitive quotes.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {myBulkRequests.map(request => (
                <div key={request.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {request.fabricCategory} - {request.fabricType}
                        </h3>
                        <StatusBadge status={request.status} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-700/50">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Quantity</p>
                          <p className="text-slate-900 dark:text-white font-bold text-lg">{request.quantity}kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Target Price</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">₹{request.targetPrice}/kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Deadline</p>
                          <p className="text-slate-900 dark:text-white font-medium">{new Date(request.deadline).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Proposals Received</p>
                          <p className="text-blue-600 dark:text-blue-400 font-bold">{proposals.filter(p => p.requestId === request.id).length}</p>
                        </div>
                      </div>

                      {request.description && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                          {request.description}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-6 lg:pt-0 lg:pl-8">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Created</p>
                        <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <>
          <TenderTracker requests={myBulkRequests} />

          {myProposals.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No proposals yet</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Once factories review your bulk requests, their quotes will appear here for your approval.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {myProposals.map(proposal => (
                <div key={proposal.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 lg:p-8 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md group">
                  <div className="flex flex-col lg:flex-row justify-between gap-6 md:gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {proposal.factoryName}
                          {proposal.status === 'Pending' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                        </h3>
                        <StatusBadge status={proposal.status} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Request Reference</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-lg">{proposal.requestTitle}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-700/50">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Price Quote</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">₹{proposal.pricePerKg}<span className="text-xs text-slate-400 font-normal">/kg</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Total Value</p>
                          <p className="text-slate-900 dark:text-white font-bold text-lg">₹{proposal.totalPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Delivery By</p>
                          <p className="text-slate-900 dark:text-white font-medium">{proposal.deliveryDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Factory Score</p>
                          <p className="text-amber-500 font-bold flex items-center gap-1">98/100</p>
                        </div>
                      </div>

                      {proposal.message && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 italic flex gap-3">
                          <MessageSquare size={16} className="shrink-0 mt-0.5 text-slate-400" />
                          {proposal.message}
                        </div>
                      )}

                      {/* Negotiation Status */}
                      {proposal.status === 'Negotiating' && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-center gap-3 text-blue-700 dark:text-blue-300">
                          <AlertCircle size={20} />
                          <div>
                            <p className="font-bold text-sm">Negotiation in Progress</p>
                            <p className="text-xs opacity-80">Waiting for factory to respond to your counter-offer.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:justify-center gap-3 min-w-full sm:min-w-0 lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-6 lg:pt-0 lg:pl-8">
                      {proposal.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleAcceptProposal(proposal)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={18} /> Accept Quote
                          </button>
                          <button
                            onClick={() => setShowNegotiate(proposal.id)}
                            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageSquare size={18} /> Negotiate
                          </button>
                          <button
                            onClick={() => updateProposalStatus(proposal.id, 'Rejected')}
                            className="w-full text-slate-400 hover:text-red-500 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            Decline Offer
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Action Taken</p>
                          <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">{new Date().toLocaleDateString()}</p>
                          <StatusBadge status={proposal.status} size="lg" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Negotiate Modal */}
      {showNegotiate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowNegotiate(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><XCircle size={24} /></button>

            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <MessageSquare size={24} />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Negotiate Terms</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Propose a new price or request changes to the delivery schedule. The factory will review your counter-offer.
            </p>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Your Message / Counter Offer</label>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none placeholder:text-slate-400"
                placeholder="e.g. We are looking for a price closer to ₹42/kg for this volume..."
                value={negotiationMsg}
                onChange={(e) => setNegotiationMsg(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowNegotiate(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateProposalStatus(showNegotiate, 'Negotiating');
                  setShowNegotiate(null);
                  setNegotiationMsg('');
                  alert('Negotiation request sent to factory!');
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, size = "sm" }) {
   const styles = {
      Accepted: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      Rejected: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
      Negotiating: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      Pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
   };

   return (
      <span className={`
         ${styles[status] || styles.Pending} 
         ${size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'}
         rounded-full font-bold border flex items-center gap-1.5 w-fit
      `}>
         {status === 'Accepted' && <CheckCircle size={size === 'lg' ? 16 : 12} />}
         {status === 'Rejected' && <XCircle size={size === 'lg' ? 16 : 12} />}
         {status === 'Negotiating' && <MessageSquare size={size === 'lg' ? 16 : 12} />}
         {status === 'Pending' && <Clock size={size === 'lg' ? 16 : 12} />}
         {status}
      </span>
   );
}
