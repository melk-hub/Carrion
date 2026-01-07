"use client";

import React, { useState } from "react";
import Select, { SingleValue, StylesConfig } from "react-select";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./AddApplicationModal.module.css";

type StatusKey =
	| "APPLIED"
	| "PENDING"
	| "REJECTED_BY_COMPANY"
	| "INTERVIEW_SCHEDULED"
	| "OFFER_RECEIVED";

export interface ApplicationFormData {
	title: string;
	company: string;
	status: StatusKey;
	location?: string;
	salary?: number;
	contractType?: string;
}

interface SelectOption {
	value: string;
	label: string;
}

interface AddApplicationModalProps {
	onAdd: (applicationData: ApplicationFormData) => void;
	onClose: () => void;
	statusMap: Record<StatusKey, string>;
}

export default function AddApplicationModal({
	onAdd,
	onClose,
	statusMap,
}: AddApplicationModalProps) {
	const { t } = useLanguage();

	const [formData, setFormData] = useState<Partial<ApplicationFormData>>({
		status: "APPLIED",
		contractType: "Full-time",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]:
				type === "number"
					? value === ""
						? undefined
						: parseFloat(value)
					: value,
		}));
	};

	const handleSelectChange = (
		id: keyof ApplicationFormData,
		option: SingleValue<SelectOption>
	) => {
		if (option) {
			setFormData((prev) => ({ ...prev, [id]: option.value }));
		}
	};

	const handleAddClick = () => {
		if (formData.company && formData.title && formData.status) {
			onAdd(formData as ApplicationFormData);
		}
	};

	const selectStyles: StylesConfig<SelectOption, false> = {
		menuPortal: (base) => ({ ...base, zIndex: 10011 }),
	};

	return (
		<div className={styles.appModalOverlay}>
			<div className={styles.appModalContainer}>
				<div className={styles.appModalHeader}>
					<h2 className={styles.appModalTitle}>
						{t("modal.add.title") as string}
					</h2>
					<button className={styles.appModalCloseBtn} onClick={onClose}>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<div className={styles.appModalContent}>
					<div className={styles.appModalGrid}>
						<div className={styles.appModalColumn}>
							<div className={styles.appModalFormGroup}>
								<label htmlFor="company" className={styles.requiredField}>
									{t("modal.add.company") as string}
								</label>
								<input
									type="text"
									id="company"
									className={styles.appModalInput}
									placeholder={t("modal.add.placeholders.company") as string}
									value={formData.company || ""}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className={styles.appModalFormGroup}>
								<label htmlFor="title" className={styles.requiredField}>
									{t("modal.add.title_job") as string}
								</label>
								<input
									type="text"
									id="title"
									className={styles.appModalInput}
									placeholder={t("modal.add.placeholders.title") as string}
									value={formData.title || ""}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className={styles.appModalFormGroup}>
								<label htmlFor="location">
									{t("modal.add.location") as string}
								</label>
								<input
									type="text"
									id="location"
									className={styles.appModalInput}
									placeholder={t("modal.add.placeholders.location") as string}
									value={formData.location || ""}
									onChange={handleInputChange}
								/>
							</div>
						</div>

						<div className={styles.appModalColumn}>
							<div className={styles.appModalFormGroup}>
								<label htmlFor="status" className={styles.requiredField}>
									{t("modal.add.status") as string}
								</label>
								<Select
									inputId="status"
									classNamePrefix="react-select"
									options={Object.entries(statusMap).map(([value, label]) => ({
										value,
										label,
									}))}
									value={Object.entries(statusMap)
										.map(([value, label]) => ({ value, label }))
										.find((o) => o.value === formData.status)}
									onChange={(option) => handleSelectChange("status", option)}
									placeholder={t("modal.add.placeholders.status") as string}
									styles={selectStyles}
									menuPortalTarget={document.body}
									required
								/>
							</div>
							<div className={styles.appModalFormGroup}>
								<label htmlFor="contractType">
									{t("modal.add.contract_type") as string}
								</label>
								<Select
									inputId="contractType"
									classNamePrefix="react-select"
									options={[
										{
											value: "Full-time",
											label: t("modal.add.contract_types.full_time") as string,
										},
										{
											value: "Part-time",
											label: t("modal.add.contract_types.part_time") as string,
										},
										{
											value: "Internship",
											label: t("modal.add.contract_types.internship") as string,
										},
										{
											value: "Contract",
											label: t("modal.add.contract_types.contract") as string,
										},
										{
											value: "Freelance",
											label: t("modal.add.contract_types.freelance") as string,
										},
									]}
									value={[
										{
											value: "Full-time",
											label: t("modal.add.contract_types.full_time") as string,
										},
										{
											value: "Part-time",
											label: t("modal.add.contract_types.part_time") as string,
										},
										{
											value: "Internship",
											label: t("modal.add.contract_types.internship") as string,
										},
										{
											value: "Contract",
											label: t("modal.add.contract_types.contract") as string,
										},
										{
											value: "Freelance",
											label: t("modal.add.contract_types.freelance") as string,
										},
									].find((o) => o.value === formData.contractType)}
									onChange={(option) =>
										handleSelectChange("contractType", option)
									}
									defaultValue={
										[
											{
												value: "Full-time",
												label: t(
													"modal.add.contract_types.full_time"
												) as string,
											},
										][0]
									}
									styles={selectStyles}
									menuPortalTarget={document.body}
								/>
							</div>
							<div className={styles.appModalFormGroup}>
								<label htmlFor="salary">
									{t("modal.add.salary") as string}
								</label>
								<div className={styles.appModalInputWithSuffix}>
									<input
										type="number"
										id="salary"
										className={styles.appModalInput}
										placeholder={t("modal.add.placeholders.salary") as string}
										value={formData.salary || ""}
										onChange={handleInputChange}
										min="0"
										step="1000"
									/>
									<span className={styles.appModalInputSuffix}>€</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className={styles.appModalFooter}>
					<button className={styles.appModalButton + " " + styles.secondary} onClick={onClose}>
						{t("common.cancel") as string}
					</button>
					<button
						className={styles.appModalButton + " " + styles.primary}
						onClick={handleAddClick}
						disabled={!formData.company || !formData.title || !formData.status}
					>
						{t("common.add") as string}
					</button>
				</div>
			</div>
		</div>
	);
}
