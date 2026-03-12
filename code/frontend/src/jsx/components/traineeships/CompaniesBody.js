const CompaniesBody = (props) => {
    return <div>
        {props.companiesData.companies.map(company => (
            <div key={company.id}>
                <h2>{company.name}</h2>
                <p>{company.overview}</p>
            </div>
        ))}
    </div>
}

export default CompaniesBody;